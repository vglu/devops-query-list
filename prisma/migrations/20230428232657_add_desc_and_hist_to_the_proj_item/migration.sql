-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project" TEXT,
    "queryName" TEXT,
    "workItemType" TEXT,
    "state" TEXT,
    "assignToName" TEXT,
    "assignToEmail" TEXT,
    "bodyId" TEXT,
    "title" TEXT,
    "priority" TEXT,
    "severity" TEXT,
    "topic" TEXT,
    "lastComment" TEXT,
    "url" TEXT,
    "ownerId" TEXT,
    "description" TEXT,
    "history" TEXT
);
INSERT INTO "new_ProjItem" ("assignToEmail", "assignToName", "bodyId", "id", "lastComment", "ownerId", "priority", "project", "queryName", "severity", "state", "title", "topic", "url", "workItemType") SELECT "assignToEmail", "assignToName", "bodyId", "id", "lastComment", "ownerId", "priority", "project", "queryName", "severity", "state", "title", "topic", "url", "workItemType" FROM "ProjItem";
DROP TABLE "ProjItem";
ALTER TABLE "new_ProjItem" RENAME TO "ProjItem";
CREATE INDEX "ProjItem_ownerId_idx" ON "ProjItem"("ownerId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
