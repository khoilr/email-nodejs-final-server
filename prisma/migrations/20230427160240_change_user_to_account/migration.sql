/*
  Warnings:

  - You are about to drop the column `userId` on the `Label` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Recipient` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Label` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Recipient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Label` DROP FOREIGN KEY `Label_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Recipient` DROP FOREIGN KEY `Recipient_userId_fkey`;

-- AlterTable
ALTER TABLE `Label` DROP COLUMN `userId`,
    ADD COLUMN `accountId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Recipient` DROP COLUMN `userId`,
    ADD COLUMN `accountId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Label` ADD CONSTRAINT `Label_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipient` ADD CONSTRAINT `Recipient_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
