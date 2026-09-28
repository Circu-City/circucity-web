-- Inventory reservations for checkout.
--
-- Inventory was only decremented in the Stripe webhook, after payment, so two buyers
-- could both pass validation for the last unit and both pay. A reservation is taken
-- under a row lock before the Stripe session is created, and stops counting once it
-- expires -- so a missed webhook frees the stock by time rather than losing it.

CREATE TABLE `CheckoutReservation` (
    `id` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CheckoutReservation_productId_status_expiresAt_idx`(`productId`, `status`, `expiresAt`),
    INDEX `CheckoutReservation_reservationId_idx`(`reservationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
