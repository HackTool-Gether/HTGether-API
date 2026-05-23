-- AlterTable
ALTER TABLE "report_templates" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "previewData" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "variables" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "htmlContent" SET DEFAULT '',
ALTER COLUMN "cssContent" SET NOT NULL,
ALTER COLUMN "cssContent" SET DEFAULT '';
