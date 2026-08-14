ALTER TABLE `Shop`
  ADD COLUMN `legalName` VARCHAR(191) NULL,
  ADD COLUMN `website` VARCHAR(191) NULL,
  ADD COLUMN `address` VARCHAR(191) NULL,
  ADD COLUMN `postalCode` VARCHAR(191) NULL,
  ADD COLUMN `city` VARCHAR(191) NULL,
  ADD COLUMN `categoryFocus` JSON NULL,
  ADD COLUMN `returnPolicy` TEXT NULL,
  ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `verifiedAt` DATETIME(3) NULL,
  ADD COLUMN `verificationStatus` ENUM('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN `verificationMethod` ENUM('BANKID', 'MANUAL', 'CHARITY_REG') NULL,
  ADD COLUMN `verificationSubmittedAt` DATETIME(3) NULL,
  ADD COLUMN `verificationReviewedAt` DATETIME(3) NULL,
  ADD COLUMN `verificationReviewedBy` VARCHAR(191) NULL,
  ADD COLUMN `verificationRejectionReason` TEXT NULL,
  ADD COLUMN `businessRegistrationVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `addressVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `managerIdentityVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `returnPolicyApproved` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `ShopFollow` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `shopId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `ShopFollow_userId_shopId_key` (`userId`, `shopId`),
  INDEX `ShopFollow_shopId_idx` (`shopId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ShopFollow_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ShopFollow_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
