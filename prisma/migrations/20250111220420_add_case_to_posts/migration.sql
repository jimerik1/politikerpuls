-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_caseId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "caseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
