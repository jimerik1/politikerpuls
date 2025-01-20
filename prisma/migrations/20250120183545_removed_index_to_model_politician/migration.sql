/*
  Warnings:

  - You are about to drop the column `isEdited` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PollAggregate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollAggregateParty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PollAggregateParty" DROP CONSTRAINT "PollAggregateParty_partyId_fkey";

-- DropForeignKey
ALTER TABLE "PollAggregateParty" DROP CONSTRAINT "PollAggregateParty_pollAggregateId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_parentId_fkey";

-- DropIndex
DROP INDEX "Politician_firstName_idx";

-- DropIndex
DROP INDEX "Post_createdById_idx";

-- DropIndex
DROP INDEX "Post_parentId_idx";

-- DropIndex
DROP INDEX "Post_staticId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isEdited",
DROP COLUMN "parentId";

-- DropTable
DROP TABLE "PollAggregate";

-- DropTable
DROP TABLE "PollAggregateParty";
