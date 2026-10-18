import type { RequestHandler } from "express";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createReadStream } from "node:fs";
import { rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createFileDecipher } from "../utils/fileCrypto.ts";
import { ensureFileNotExpired } from "../utils/fileExpiration.ts";

const paramsValidator = z.object({
  uuid: z.uuid().describe("File UUID."),
});

/**
 * GET /files/:uuid
 * Optional header:
 * - X-File-Password: string = password if the file is protected
 * Responses:
 * - 200: file content
 * - 401: missing or invalid password
 * - 404: file not found
 * - 410: file expired or already downloaded (single use)
 */
export const handlers: RequestHandler[] = [
  async (req, res) => {
    const { uuid } = paramsValidator.parse(req.params);
    const password = req.get("X-File-Password");

    const metadata = await prisma.file.findUnique({
      where: { id: uuid },
    });

    if (metadata === null) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    await ensureFileNotExpired(uuid, metadata.retention);

    res
      .status(200)
      .contentType(metadata.mimeType)
      .header("Content-Disposition", `attachment; filename="${metadata.name}"`);

    if (password === undefined) {
      if (metadata.cryptdata) {
        res.status(401).json({ error: "Missing password" });
        return;
      }
      await pipeline(createReadStream("files/" + uuid), res);
    } else {
      if (!metadata.cryptdata) {
        res.status(422).json({ error: "Unnecessary password" });
        return;
      }

      try {
        // Decrypt once to check if the password is correct
        await pipeline(
          createReadStream("files/" + uuid),
          createFileDecipher(metadata.cryptdata, password),
        );
      } catch {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
      // If correct, decrypt again and pipe it into the response
      // We cant decrypt only once because as soon as we start piping into the response,
      // we cant modify headers so when the wrong password throws its too late to return an error instead
      await pipeline(
        createReadStream("files/" + uuid),
        createFileDecipher(metadata.cryptdata, password),
        res,
      );
    }

    if (metadata.autodestruct) {
      await prisma.file.delete({ where: { id: uuid } });
      await rm("files/" + uuid);
    }
  },
];
