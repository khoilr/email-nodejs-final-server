-- AlterTable
ALTER TABLE `Account` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Blocking` (
    `id` VARCHAR(191) NOT NULL,
    `blockerId` VARCHAR(191) NOT NULL,
    `blockingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Blocking` ADD CONSTRAINT `Blocking_blockerId_fkey` FOREIGN KEY (`blockerId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blocking` ADD CONSTRAINT `Blocking_blockingId_fkey` FOREIGN KEY (`blockingId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
