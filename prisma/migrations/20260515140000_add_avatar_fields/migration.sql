-- AlterTable
ALTER TABLE "users" ADD COLUMN "avatarStyle" TEXT NOT NULL DEFAULT 'adventurer';
ALTER TABLE "users" ADD COLUMN "avatarSeed" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "avatarOptions" JSONB NOT NULL DEFAULT '{}';
