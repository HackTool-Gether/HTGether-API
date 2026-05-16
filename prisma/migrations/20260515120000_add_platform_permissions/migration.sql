-- AlterTable
ALTER TABLE "users" ADD COLUMN "platformPermissions" JSONB NOT NULL DEFAULT '{}';
