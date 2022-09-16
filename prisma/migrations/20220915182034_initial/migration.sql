-- CreateTable
CREATE TABLE "PatTable" (
    "patId" TEXT NOT NULL PRIMARY KEY,
    "pat" TEXT NOT NULL,
    "dateExp" DATETIME NOT NULL,
    "userLoginId" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
