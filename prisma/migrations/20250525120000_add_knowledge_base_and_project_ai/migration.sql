-- CreateTable
CREATE TABLE "knowledge_entries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'text',
    "scope" TEXT NOT NULL DEFAULT 'enterprise',
    "fileName" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_entries_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "projects" ADD COLUMN "aiEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "aiScopeIds" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE INDEX "knowledge_entries_scope_userId_idx" ON "knowledge_entries"("scope", "userId");

-- AddForeignKey
ALTER TABLE "knowledge_entries" ADD CONSTRAINT "knowledge_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
