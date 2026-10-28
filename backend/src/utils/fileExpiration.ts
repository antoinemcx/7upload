import { readdir, rm, stat } from "node:fs/promises";
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

export async function deleteExpiredAndLostFiles() {
  // verify files that are in the file folder but not registered in the db

  // retrieving files in DB
  const files = await prisma.file.findMany({
    include: {
      folder: true,
    },
  });
  const filesIds = new Set(files.map((file) => file.id));

  // retrieving files currently present in folder /files
  const filesFolder = (await readdir("files/", { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const filesFolderIds = new Set(filesFolder);

  const missingFromDatabase = filesFolderIds.difference(filesIds);

  const missingFromFolder = filesIds.difference(filesFolderIds);

  // Delete files that are present in the folder but not registered in the DB.
  for (const fileId of missingFromDatabase) {
    await rm("files/" + fileId, { force: true });
  }

  // Delete DB records for files that are no longer in the folder.
  for (const fileId of missingFromFolder) {
    await prisma.file.delete({ where: { id: fileId } });
  }

  // Delete expired files by calling ensureFileNotExpired.
  for (const file of files) {
    if (missingFromFolder.has(file.id)) continue;

    try {
      await ensureFileNotExpired(file.id, file.folder.retention);
    } catch (error) {
      if ((error as { status?: number }).status !== 410) throw error;
    }
  }
}
