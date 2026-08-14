# CircuCity Shield Fee & Seller VAT Implementation

This document outlines the implementation details for the CircuCity Shield Fee and Seller Onboarding paths (Private vs. Business sellers).

## Summary of Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Added `SellerType` enum with values `PRIVATE` and `BUSINESS`.
- Added `organizationNumber` exclusively for Business sellers in the `Shop` model.
- Added `feeGross`, `feeVat`, and `feeNet` to the `Order` model to accurately record platform revenue from the Shield Fee, separate from the Stripe processing fee.

### 2. Legal Texts (`app/terms-of-service/page.tsx`)
- Appended concrete definitions for Private and Business Sellers in the Terms of Service.
- Added clarification of the VAT Margin Scheme (VMB) guidelines for second-hand goods sold by businesses.
- Outlined the purpose and calculation of the CircuCity Shield Fee for buyers.

### 3. Seller Onboarding Form (`app/become-seller/page.tsx` & `app/actions/shop.ts`)
- Replaced the generic shop form with a toggle for **Private Seller** vs **Business Seller**.
- Conditionally renders Organization Number text field for business sellers.
- Updated the `registerShop` server action to save this new information correctly to the Prisma `Shop` model.

### 4. Pricing Logic (`lib/pricing.ts` & `app/actions/product.ts`)
- Removed the old, invisible 10% platform fee functions (`calculateFinalPrice`, `calculateFeeAmount`).
- Added the new transparent Shield Fee module (`calculateShieldFee`), which returns `(6% of Item Value + 8 Kr)`.
- Removed all hidden price inflation from the product creation and update server actions (`createProduct`, `updateProduct`). Sellers now keep exactly 100% of their listed price.
- Replaced the fee breakdown visualization in the Product form (`ProductForm.tsx`, `AddProductModal.tsx`) with a clear message: *"Buyers pay a Shield Fee at checkout. You keep exactly what you list!"*

### 5. Cart & Stripe Session (`app/cart/page.tsx` & `app/actions/stripe.ts`)
- Added a `Shield Fee` calculation readout line within the Cart Order Summary.
- Programmatically injects a custom Stripe checkout `line_item` labeled **"CircuCity Shield Fee"** inside `createCheckoutSession` and `createCartCheckoutSession`.

### 6. Stripe Webhook & Admin Dashboard (`app/api/webhooks/stripe/route.ts` & `app/dashboard/admin/page.tsx`)
- Updated the Stripe webhook listener (`checkout.session.completed`) to parse the actual item subtotal and calculate `feeGross`.
- Deducts a 25% VAT overhead from the gross fee (calculated as `feeGross * 0.20` since VAT is inclusive) and records `feeNet` income to the Order row.
- Altered the core SQL queries inside the Admin Dashboard overview (`/dashboard/admin/page.tsx`) to visualize global `Net Revenue` using `feeNet` instead of `processingFee`, correctly representing actual CircuCity profit.
