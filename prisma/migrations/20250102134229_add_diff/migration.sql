/*
  Warnings:

  - Added the required column `diff` to the `RoundAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoundAction" ADD COLUMN     "diff" INTEGER NOT NULL;
