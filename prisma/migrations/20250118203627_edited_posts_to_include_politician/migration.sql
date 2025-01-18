-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "politicianId" TEXT;

-- CreateIndex
CREATE INDEX "Post_politicianId_idx" ON "Post"("politicianId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_politicianId_fkey" FOREIGN KEY ("politicianId") REFERENCES "Politician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
