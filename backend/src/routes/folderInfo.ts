import type { RequestHandler } from "express";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createFileDecipher } from "../utils/fileCrypto.ts";
import { ensureFileNotExpired } from "../utils/fileExpiration.ts";

const paramsValidator = z.object({
  uuid: z.uuid().describe("File UUID."),
});

/**
 * GET /folders/:uuid
 * Optional header:
 * - X-File-Password: string = password if the files are protected
 * Responses:
 * - 200: fodler metadata
 * - 401: missing or invalid password
 * - 404: folder not found
 */
export const handlers: RequestHandler[] = [
  async (req, res) => {
    const { uuid } = paramsValidator.parse(req.params);

    const metadata = await prisma.folder.findUnique({
      where: { id: uuid },
      include: { files: true },
    });

    if (metadata === null) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    for (const file of metadata.files) {
      await ensureFileNotExpired(file.id, metadata.retention);
    }

    if (metadata.files[0].cryptdata) {
      const password = req.get("X-File-Password");
      if (!password) {
        res.status(401).json({ protected: true, error: "Missing password" });
        return;
      }

      // Validate the password by decrypting the file
      try {
        await pipeline(
          createReadStream("files/" + metadata.files[0].id),
          createFileDecipher(metadata.files[0].cryptdata, password),
        );
      } catch {
        res.status(401).json({ protected: true, error: "Invalid password" });
        return;
      }
    }

    // Returning file metadata and retention time remaining in seconds
    const file = await stat("files/" + metadata.files[0].id);
    const remaining = Math.max(
      0,
      metadata.retention - Math.floor((Date.now() - file.mtimeMs) / 1000),
    );

    res.json({
      files: metadata.files.map((file) => ({
        id: file.id,
        name: file.name,
        mimetype: file.mimetype,
      })),
      remaining,
      autodestruct: metadata.autodestruct,
    });
  },
];
