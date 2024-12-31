-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "mainTopicId" TEXT;

-- CreateIndex
CREATE INDEX "Case_mainTopicId_idx" ON "Case"("mainTopicId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_mainTopicId_fkey" FOREIGN KEY ("mainTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
