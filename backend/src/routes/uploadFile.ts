import type { RequestHandler } from "express";
import multer from "multer";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createHash } from "node:crypto";
import { mkdir, rename, rm } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { scryptSync, randomBytes, createCipheriv } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { AUTH_TAG_LENGTH, IV_LENGTH, SALT_LENGTH } from "../consts.ts";

const salt = randomBytes(SALT_LENGTH);

const upload = multer({ dest: "tmp/files/" });

const validator = z.object({
  retention: z.coerce
    .number()
    .int()
    .positive()
    .describe("File retention duration in seconds."),
  autodestruct: z
    .enum(["true", "false"])
    .describe("True if the file is deleted after the first download."),
  password: z
    .string()
    .optional()
    .describe("Optional. Password to protect the file for download."),
});

export const handlers: RequestHandler[] = [
  upload.single("files"),
  async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(422).send();
      return;
    }
    const { retention, autodestruct, password } = validator.parse(req.body);

    const hash = createHash("sha256");
    await pipeline(createReadStream(file.path), hash);

    const entity = await prisma.file.create({
      data: {
        name: file.originalname,
        mimeType: file.mimetype,
        hash: hash.digest(),
        retention,
        autodestruct: autodestruct === "true",
      },
    });

    await mkdir("files", { recursive: true });

    if (password === undefined) {
      await rename(file.path, "files/" + entity.id);
    } else {
      const key = scryptSync(password, salt, 32);
      const iv = randomBytes(IV_LENGTH);
      const cipher = createCipheriv("aes-256-gcm", key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      await pipeline(
        createReadStream(file.path),
        cipher,
        createWriteStream("files/" + entity.id),
      );
      await prisma.file.update({
        where: { id: entity.id },
        data: { cryptdata: Buffer.concat([salt, iv, cipher.getAuthTag()]) },
      });
      await rm(file.path);
    }

    res.status(201).json({
      id: entity.id,
      link: `${req.protocol}://${req.get("host")}/files/${entity.id}`,
    });
  },
];
