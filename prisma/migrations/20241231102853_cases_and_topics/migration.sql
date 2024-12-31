-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "rapporteurId" TEXT;

-- CreateTable
CREATE TABLE "CaseProposer" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "politicianId" TEXT NOT NULL,
    "proposerType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseProposer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseProposer_caseId_idx" ON "CaseProposer"("caseId");

-- CreateIndex
CREATE INDEX "CaseProposer_politicianId_idx" ON "CaseProposer"("politicianId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseProposer_caseId_politicianId_key" ON "CaseProposer"("caseId", "politicianId");

-- CreateIndex
CREATE INDEX "Case_rapporteurId_idx" ON "Case"("rapporteurId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_rapporteurId_fkey" FOREIGN KEY ("rapporteurId") REFERENCES "Politician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseProposer" ADD CONSTRAINT "CaseProposer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseProposer" ADD CONSTRAINT "CaseProposer_politicianId_fkey" FOREIGN KEY ("politicianId") REFERENCES "Politician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
