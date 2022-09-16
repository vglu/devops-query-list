/*
  Warnings:

  - You are about to drop the column `userLoginId` on the `PatTable` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `PatTable` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PatTable" (
    "patId" TEXT NOT NULL PRIMARY KEY,
    "pat" TEXT NOT NULL,
    "dateExp" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_PatTable" ("dateExp", "description", "pat", "patId") SELECT "dateExp", "description", "pat", "patId" FROM "PatTable";
DROP TABLE "PatTable";
ALTER TABLE "new_PatTable" RENAME TO "PatTable";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
