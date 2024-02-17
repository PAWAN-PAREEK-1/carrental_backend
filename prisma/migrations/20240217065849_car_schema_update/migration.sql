/*
  Warnings:

  - Made the column `carNumber` on table `car` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carRcNumber` on table `car` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `carNumber` VARCHAR(191) NOT NULL,
    MODIFY `carRcNumber` VARCHAR(191) NOT NULL;
