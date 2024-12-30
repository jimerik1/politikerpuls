/*
  Warnings:

  - Made the column `type` on table `Case` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "type" SET NOT NULL;
