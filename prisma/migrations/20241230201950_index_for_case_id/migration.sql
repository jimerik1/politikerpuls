/*
  Warnings:

  - A unique constraint covering the columns `[stortingetId]` on the table `Case` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stortingetId` to the `Case` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "stortingetId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Case_stortingetId_key" ON "Case"("stortingetId");

-- CreateIndex
CREATE INDEX "Case_stortingetId_idx" ON "Case"("stortingetId");
