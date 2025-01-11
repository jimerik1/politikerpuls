/*
  Warnings:

  - Added the required column `caseId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "caseId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Post_caseId_idx" ON "Post"("caseId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
