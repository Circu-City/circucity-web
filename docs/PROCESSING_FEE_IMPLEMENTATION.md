
# CircuCity Processing Fee Implementation

As requested, we have implemented the automatic recording of CircuCity's processing fee for every order. This allows for accurate tracking of net revenue and platform earnings.

## 1. Overview
The goal is to calculate the portion of each transaction that belongs to CircuCity (Platform Fee) versus the amount that will be paid out to sellers.

**Fee Structure Implemented:**
- **Percentage Fee:** 2.5% of the total order value.
- **Fixed Fee:** $0.50 per transaction (approx. 5 SEK).

This ensures profitability even on low-value items.

## 2. Database Schema Changes
We updated the `Order` model in `prisma/schema.prisma` to include a dedicated field for storing this fee.

```prisma
model Order {
  // ... existing fields
  refundAmount       Decimal?  @db.Decimal(10, 2)
  stripeChargeId     String? // For tracking refunds
  
  // NEW FIELD
  processingFee      Decimal?  @db.Decimal(10, 2) // CircuCity processing fee (2.5% + fixed)
  
  // ... existing fields
}
```

## 3. Logic Implementation
The fee calculation logic resides in the backend, specifically within the **Stripe Webhook Handler** (`app/api/webhooks/stripe/route.ts`). This ensures that fees are calculated securely on the server side the moment a payment is confirmed.

### Code Snippet (Webhook Handler)
```typescript
// app/api/webhooks/stripe/route.ts

// Fee Configuration Constants
const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
const PLATFORM_FIXED_FEE = 0.50; // $0.50 (Fixed amount)

// ... inside the checkout.session.completed event handler ...

// 1. Get the total order amount from Stripe
const orderTotal = Number(retrievedSession.amount_total) / 100;

// 2. Calculate the fee
const processingFee = (orderTotal * PLATFORM_FEE_PERCENTAGE) + PLATFORM_FIXED_FEE;

// 3. Save to database
const order = await prisma.order.create({
    data: {
        userId: userId,
        total: orderTotal,
        processingFee: processingFee, // <--- Stored here
        status: 'PAID',
        // ... rest of order data
    }
});
```

## 4. How It Works in Practice
1.  **Customer Pays:** A user buys a product for $100.
2.  **Stripe Processes:** Stripe confirms the payment and sends a webhook to our server.
3.  **Calculation:**
    *   Percentage: $100 * 2.5% = $2.50
    *   Fixed: $0.50
    *   **Total Processing Fee:** $3.00
4.  **Data Storage:** The order is saved in the database with `total: 100.00` and `processingFee: 3.00`.
5.  **Net Revenue:** When calculating future payouts, the seller's share will be `100.00 - 3.00 = 97.00` (excluding any shipping/tax complexities).

## 5. Future Usage
This implementation lays the groundwork for:
- **Seller Payouts:** Automatically deducting CircuCity's cut before transferring funds to sellers.
- **Revenue Dashboard:** Displaying total platform earnings separate from Gross Merchandise Value (GMV).
