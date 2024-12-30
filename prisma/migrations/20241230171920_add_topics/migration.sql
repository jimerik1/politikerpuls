-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isMainTopic" BOOLEAN NOT NULL DEFAULT false,
    "mainTopicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CaseTopicToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaseTopicToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Topic_mainTopicId_idx" ON "Topic"("mainTopicId");

-- CreateIndex
CREATE INDEX "_CaseTopicToTopic_B_index" ON "_CaseTopicToTopic"("B");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_mainTopicId_fkey" FOREIGN KEY ("mainTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseTopicToTopic" ADD CONSTRAINT "_CaseTopicToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseTopicToTopic" ADD CONSTRAINT "_CaseTopicToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
