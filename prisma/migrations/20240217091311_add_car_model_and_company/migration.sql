-- CreateTable
CREATE TABLE `carCompany` (
    `id` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carModel` (
    `id` VARCHAR(191) NOT NULL,
    `mdoel` VARCHAR(191) NOT NULL,
    `carCompanyId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `carModel` ADD CONSTRAINT `carModel_carCompanyId_fkey` FOREIGN KEY (`carCompanyId`) REFERENCES `carCompany`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
