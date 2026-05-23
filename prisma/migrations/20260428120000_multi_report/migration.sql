-- AlterTable: remove unique constraint on projectId to allow multiple reports per project
DROP INDEX IF EXISTS "reports_projectId_key";

-- AlterTable: add name column with default value
ALTER TABLE "reports" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Rapport principal';

-- AlterTable: add optional templateId column
ALTER TABLE "reports" ADD COLUMN "templateId" TEXT;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
