-- CreateTable
CREATE TABLE "PollAggregate" (
    "id" TEXT NOT NULL,
    "pollDate" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "source" TEXT,
    "year" INTEGER,
    "month" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollAggregateParty" (
    "id" TEXT NOT NULL,
    "pollAggregateId" TEXT NOT NULL,
    "partyId" TEXT,
    "partyName" TEXT,
    "percentage" DECIMAL(5,2) NOT NULL,
    "seats" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollAggregateParty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PollAggregate_pollDate_idx" ON "PollAggregate"("pollDate");

-- CreateIndex
CREATE UNIQUE INDEX "PollAggregate_year_month_key" ON "PollAggregate"("year", "month");

-- CreateIndex
CREATE INDEX "PollAggregateParty_pollAggregateId_idx" ON "PollAggregateParty"("pollAggregateId");

-- CreateIndex
CREATE INDEX "PollAggregateParty_partyId_idx" ON "PollAggregateParty"("partyId");

-- AddForeignKey
ALTER TABLE "PollAggregateParty" ADD CONSTRAINT "PollAggregateParty_pollAggregateId_fkey" FOREIGN KEY ("pollAggregateId") REFERENCES "PollAggregate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollAggregateParty" ADD CONSTRAINT "PollAggregateParty_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
