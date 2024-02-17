/*
  Warnings:

  - Added the required column `carCompany` to the `car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `car` ADD COLUMN `carCompany` VARCHAR(191) NOT NULL,
    MODIFY `unit` VARCHAR(191) NOT NULL;
