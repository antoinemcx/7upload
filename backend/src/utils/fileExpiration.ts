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
  const filesDB = await prisma.file.findMany({
    select: {
      id: true,
      retention: true,
    },
  });
  const filesDBIds = new Set(filesDB.map((file) => file.id));
  // console.log(filesDBIds);

  // retrieving files currently present in folder /files
  const filesFolder = (await readdir("files/", { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const filesFolderIds = new Set(filesFolder);
  // console.log(filesDBIds);

  // Files present in the folder but absent from the database
  const missingFromDatabase = filesFolderIds.difference(filesDBIds);

  // Files registered in the database but absent from the folder
  const missingFromFolder = filesDBIds.difference(filesFolderIds);

  console.log("Files missing from database:", missingFromDatabase);
  console.log("Files missing from folder:", missingFromFolder);
  console.log(missingFromDatabase.size);
  console.log(missingFromFolder.size);

  // TODO 1:
  // Delete files that are present in the folder but not registered in the DB.
  for (const fileId of missingFromDatabase) {
    await rm("files/" + fileId, { force: true });
  }

  // TODO 2:
  // Delete DB records for files that are no longer in the folder.
  for (const fileId of missingFromFolder) {
    await prisma.file.delete({ where: { id: fileId } });
  }

  // TODO 3:
  // Delete expired files by calling ensureFileNotExpired.
  for (const file of filesDB) {
    if (missingFromFolder.has(file.id)) continue;

    try {
      await ensureFileNotExpired(file.id, file.retention);
    } catch (error) {
      if ((error as { status?: number }).status !== 410) throw error;
    }
  }
}
