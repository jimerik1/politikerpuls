-- CreateTable
CREATE TABLE "Biography" (
    "id" TEXT NOT NULL,
    "politicianId" TEXT NOT NULL,
    "fatherName" TEXT,
    "fatherBirthYear" INTEGER,
    "fatherDeathYear" INTEGER,
    "fatherOccupation" TEXT,
    "motherName" TEXT,
    "motherBirthYear" INTEGER,
    "motherDeathYear" INTEGER,
    "motherOccupation" TEXT,
    "birthCounty" TEXT,
    "birthMunicipality" TEXT,
    "memorialDate" TIMESTAMP(3),
    "seniorityYears" INTEGER,
    "seniorityDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "publisher" TEXT,
    "location" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRecord" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "substituteFirstName" TEXT,
    "substituteLastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherActivity" (
    "id" TEXT NOT NULL,
    "biographyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Biography_politicianId_key" ON "Biography"("politicianId");

-- CreateIndex
CREATE INDEX "Education_biographyId_idx" ON "Education"("biographyId");

-- CreateIndex
CREATE INDEX "WorkExperience_biographyId_idx" ON "WorkExperience"("biographyId");

-- CreateIndex
CREATE INDEX "Publication_biographyId_idx" ON "Publication"("biographyId");

-- CreateIndex
CREATE INDEX "LeaveRecord_biographyId_idx" ON "LeaveRecord"("biographyId");

-- CreateIndex
CREATE INDEX "Award_biographyId_idx" ON "Award"("biographyId");

-- CreateIndex
CREATE INDEX "OtherActivity_biographyId_idx" ON "OtherActivity"("biographyId");

-- AddForeignKey
ALTER TABLE "Biography" ADD CONSTRAINT "Biography_politicianId_fkey" FOREIGN KEY ("politicianId") REFERENCES "Politician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRecord" ADD CONSTRAINT "LeaveRecord_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherActivity" ADD CONSTRAINT "OtherActivity_biographyId_fkey" FOREIGN KEY ("biographyId") REFERENCES "Biography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
