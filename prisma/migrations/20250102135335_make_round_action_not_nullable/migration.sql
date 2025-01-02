/*
  Warnings:

  - Made the column `roundInfoId` on table `RoundAction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RoundAction" DROP CONSTRAINT "RoundAction_roundInfoId_fkey";

-- AlterTable
ALTER TABLE "RoundAction" ALTER COLUMN "roundInfoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RoundAction" ADD CONSTRAINT "RoundAction_roundInfoId_fkey" FOREIGN KEY ("roundInfoId") REFERENCES "RoundInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
