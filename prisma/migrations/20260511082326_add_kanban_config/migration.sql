-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "kanbanConfig" JSONB NOT NULL DEFAULT '{}';
