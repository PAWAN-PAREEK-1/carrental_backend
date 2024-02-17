/*
  Warnings:

  - A unique constraint covering the columns `[carNumber]` on the table `car` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `car` DROP FOREIGN KEY `car_userId_fkey`;

-- AlterTable
ALTER TABLE `car` ADD COLUMN `carInsuranceNum` VARCHAR(191) NULL,
    ADD COLUMN `carNumber` VARCHAR(191) NULL,
    ADD COLUMN `carRcNumber` VARCHAR(191) NULL,
    ADD COLUMN `engineNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `car_carNumber_key` ON `car`(`carNumber`);

-- AddForeignKey
ALTER TABLE `car` ADD CONSTRAINT `car_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
