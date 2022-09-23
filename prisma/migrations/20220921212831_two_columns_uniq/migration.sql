/*
  Warnings:

  - A unique constraint covering the columns `[patId,ownerId]` on the table `PatTable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projId,ownerId]` on the table `ProjTable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PatTable_patId_ownerId_key" ON "PatTable"("patId", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjTable_projId_ownerId_key" ON "ProjTable"("projId", "ownerId");
