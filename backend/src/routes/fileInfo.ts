import type { RequestHandler } from "express";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createFileDecipher } from "../utils/fileCrypto.ts";

const paramsValidator = z.object({
  uuid: z.uuid().describe("File UUID."),
});

/**
 * GET /files/:uuid/info
 * Optional header:
 * - X-File-Password: string = password if the file is protected
 * Responses:
 * - 200: file metadata
 * - 401: missing or invalid password
 * - 404: file not found
 */
export const handlers: RequestHandler[] = [
  async (req, res) => {
    const { uuid } = paramsValidator.parse(req.params);

    const metadata = await prisma.file.findUnique({
      where: { id: uuid },
    });

    if (metadata === null) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const extension = metadata.name.includes(".")
      ? metadata.name.slice(metadata.name.lastIndexOf("."))
      : "";

    if (metadata.cryptdata) {
      const password = req.get("X-File-Password");
      if (!password) {
        res.status(401).json({ protected: true, extension });
        return;
      }

      // Validate the password by decrypting the file
      try {
        await pipeline(
          createReadStream("files/" + uuid),
          createFileDecipher(metadata.cryptdata, password),
          new PassThrough(),
        );
      } catch {
        res.status(401).json({ protected: true, extension, error: "Invalid password" });
        return;
      }
    }

    // Returning file metadata and retention time remaining in seconds
    const file = await stat("files/" + uuid);
    const remaining = Math.max(
      0,
      metadata.retention - Math.floor((Date.now() - file.mtimeMs) / 1000),
    );

    res.json({
      name: metadata.name,
      mimeType: metadata.mimeType,
      remaining,
      autodestruct: metadata.autodestruct,
    });
  },
];
