-- DropIndex
DROP INDEX IF EXISTS "conversations_projectId_memberId_key";

-- AlterTable: drop old column, add new columns
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "memberId";
ALTER TABLE "conversations" DROP COLUMN IF EXISTS "readAt";
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "user1Id" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "user2Id" TEXT;

-- Delete any existing rows (no production data)
DELETE FROM "messages";
DELETE FROM "conversations";

-- Make columns required
ALTER TABLE "conversations" ALTER COLUMN "user1Id" SET NOT NULL;
ALTER TABLE "conversations" ALTER COLUMN "user2Id" SET NOT NULL;

-- AlterTable messages: drop readAt, add index
ALTER TABLE "messages" DROP COLUMN IF EXISTS "readAt";

-- CreateIndex
CREATE UNIQUE INDEX "conversations_projectId_user1Id_user2Id_key" ON "conversations"("projectId", "user1Id", "user2Id");
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
