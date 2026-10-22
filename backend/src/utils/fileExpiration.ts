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

  // TODO 1 :
  // si non vide missingFromDatabase -> delete dans folder les uuid

  // TODO 2 :
  // si non vide missingFromFolder -> delete dans DB les uuid

  // TODO 3 :
  // delete expired files in the database with a loop for and calling the previous function ensureFileNotExpired
}
