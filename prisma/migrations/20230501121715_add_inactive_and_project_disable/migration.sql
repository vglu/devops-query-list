-- AlterTable
ALTER TABLE "ProjItem" ADD COLUMN "inactiveDays" INTEGER;

-- AlterTable
ALTER TABLE "ProjTable" ADD COLUMN "disabled" BOOLEAN DEFAULT false;
