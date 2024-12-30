-- CreateTable
CREATE TABLE "GovernmentMember" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "politicianId" TEXT,
    "partyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GovernmentMember_department_idx" ON "GovernmentMember"("department");

-- CreateIndex
CREATE INDEX "GovernmentMember_startDate_endDate_idx" ON "GovernmentMember"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "GovernmentMember" ADD CONSTRAINT "GovernmentMember_politicianId_fkey" FOREIGN KEY ("politicianId") REFERENCES "Politician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentMember" ADD CONSTRAINT "GovernmentMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
