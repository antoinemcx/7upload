/*
  Warnings:

  - You are about to drop the column `iv` on the `File` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "hash" BLOB NOT NULL,
    "retention" INTEGER NOT NULL,
    "autodestruct" BOOLEAN NOT NULL,
    "cryptdata" BLOB
);
INSERT INTO "new_File" ("autodestruct", "hash", "id", "mimeType", "name", "retention") SELECT "autodestruct", "hash", "id", "mimeType", "name", "retention" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
