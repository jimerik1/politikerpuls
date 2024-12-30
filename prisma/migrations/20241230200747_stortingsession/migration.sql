-- CreateTable
CREATE TABLE "StortingSession" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StortingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StortingSession_startDate_endDate_idx" ON "StortingSession"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StortingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
