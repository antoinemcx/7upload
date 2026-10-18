import type { RequestHandler } from "express";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createReadStream } from "node:fs";
import { rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createDecipheriv, scryptSync } from "node:crypto";
import { AUTH_TAG_LENGTH, IV_LENGTH, SALT_LENGTH } from "../consts.ts";

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

    // TODO: check expiration (410 if expired)

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

      const salt = metadata.cryptdata.subarray(0, SALT_LENGTH);
      const iv = metadata.cryptdata.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const authTag = metadata.cryptdata.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
      );

      const key = scryptSync(password, salt, 32);

      const createDecipher = () => {
        const d = createDecipheriv("aes-256-gcm", key, iv);
        d.setAuthTag(authTag);
        return d;
      };

      try {
        await pipeline(createReadStream("files/" + uuid), createDecipher());
      } catch {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
      await pipeline(createReadStream("files/" + uuid), createDecipher(), res);
    }

    if (metadata.autodestruct) {
      await prisma.file.delete({ where: { id: uuid } });
      await rm("files/" + uuid);
    }
  },
];
