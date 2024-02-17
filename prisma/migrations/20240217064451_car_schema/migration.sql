-- CreateTable
CREATE TABLE `car` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `seat` INTEGER NOT NULL,
    `doors` INTEGER NOT NULL,
    `fuelType` ENUM('PETROL', 'DIESEL', 'CNG', 'LPG', 'BIO', 'ETHANOL', 'METHANOL', 'ELECTRIC') NOT NULL,
    `transmission` ENUM('MANUAL', 'AUTOMATIC') NOT NULL,
    `ac` BOOLEAN NULL DEFAULT true,
    `sunroof` BOOLEAN NULL DEFAULT false,
    `carName` VARCHAR(191) NOT NULL,
    `carModel` VARCHAR(191) NOT NULL,
    `rate` INTEGER NOT NULL,
    `unit` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `car` ADD CONSTRAINT `car_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
