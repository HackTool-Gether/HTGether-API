/*
  Warnings:

  - Added the required column `projectId` to the `findings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "platform_settings_key_key";

-- AlterTable
ALTER TABLE "findings" ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT,
ALTER COLUMN "description" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "findings_projectId_idx" ON "findings"("projectId");

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
