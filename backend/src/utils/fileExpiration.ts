import { rm, stat } from "node:fs/promises";
import { prisma } from "../prisma.ts";

/** Deletes an expired file and throws an HTTP 410 error. */
export async function ensureFileNotExpired(uuid: string, retention: number) {
  const file = await stat("files/" + uuid);
  const age = (Date.now() - file.mtimeMs) / 1000;

  if (age < retention) return;

  await prisma.file.delete({ where: { id: uuid } });
  await rm("files/" + uuid, { force: true });

  const error = new Error("File expired and was deleted") as Error & { status: number };
  error.status = 410;
  throw error;
}
