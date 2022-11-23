-- CreateTable
CREATE TABLE "ProjItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project" TEXT NOT NULL,
    "queryName" TEXT NOT NULL,
    "workItemType" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "assignToName" TEXT NOT NULL,
    "assignToEmail" TEXT NOT NULL,
    "bodyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "lastComment" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "ProjItem_ownerId_idx" ON "ProjItem"("ownerId");

-- CreateIndex
CREATE INDEX "PatTable_ownerId_idx" ON "PatTable"("ownerId");

-- CreateIndex
CREATE INDEX "ProjTable_ownerId_idx" ON "ProjTable"("ownerId");
