-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;
