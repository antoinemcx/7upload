import type { RequestHandler } from "express";
import multer from "multer";
import z from "zod";
import { prisma } from "../prisma.ts";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename } from "node:fs/promises";
import { createReadStream } from "node:fs";

const upload = multer({ dest: "tmp/files/" });

const validator = z.object({
  retention: z.coerce.number().int().positive(),
  autodestruct: z.coerce.boolean(),
  password: z.string().optional(),
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

    const readStream = createReadStream(file.path);
    readStream.pipe(hash);
    hash.end();

    const entity = await prisma.file.create({
      data: {
        name: file.filename,
        mimeType: file.mimetype,
        hash: hash.digest(),
        retention,
        autodestruct,
      },
    });

    await mkdir("files");
    await rename(file.path, "files/" + entity.id);

    res.status(201).json({
      id: entity.id,
      link: `${req.protocol}://${req.get("host")}/files/${entity.id}`,
    });
  },
];
