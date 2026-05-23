-- CreateTable
CREATE TABLE "project_remarks" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "project_remarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_remarks_projectId_createdAt_idx" ON "project_remarks"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "project_remarks" ADD CONSTRAINT "project_remarks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_remarks" ADD CONSTRAINT "project_remarks_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
