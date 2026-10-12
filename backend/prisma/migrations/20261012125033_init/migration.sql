-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "hash" BLOB NOT NULL,
    "retention" INTEGER NOT NULL,
    "autodestruct" BOOLEAN NOT NULL
);
