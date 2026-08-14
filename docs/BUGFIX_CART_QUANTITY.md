# Cart Quantity Bug Fix

## Problem
When buyers selected a quantity greater than 1 on the product page and clicked "Checkout", Stripe would only charge for 1 item instead of the selected quantity.

## Root Cause
The product detail page (`app/products/[id]/page.tsx`) had **two separate checkout paths**:

1. **Add to Cart** → Cart Page → Checkout (✅ Correct - respects quantity)
2. **Direct Checkout Button** → Stripe (❌ Bug - hardcoded quantity=1)

The direct checkout button was calling `createCheckoutSession(productId)` which hardcoded the quantity to 1:

```typescript
// app/actions/stripe.ts - Line 91
quantity: 1,  // ❌ Always 1, ignoring user's selection
```

## Solution
**Removed the direct checkout button** from the product detail page. Now users must:
1. Select quantity using the quantity selector
2. Click "Add to Cart" to add items to their cart
3. Navigate to the cart page
4. Click "Checkout" from the cart

This ensures the cart checkout flow (`createCartCheckoutSession`) is always used, which correctly passes the quantity to Stripe:

```typescript
// app/actions/stripe.ts - Line 157
quantity: item.quantity,  // ✅ Uses actual cart quantity
```

## Files Changed
1. **`app/products/[id]/page.tsx`**
   - Removed `<CheckoutButton priceId={product.id} />` component
   - Removed unused import for `CheckoutButton`

## Testing
✅ Verified that the product page now only shows:
- Quantity selector (-, number, +)
- "Add to Cart" button
- No direct checkout button

✅ Cart checkout flow correctly passes quantities to Stripe

## Additional Improvements Made
Added debug logging to help track cart checkout flow:
- `app/actions/stripe.ts`: Logs line items being created for Stripe
- `app/cart/page.tsx`: Logs cart items being sent to checkout

## Notes
The `createCheckoutSession` function (single product checkout) is still available but is no longer used in the UI. It could be removed entirely or updated to accept a quantity parameter if direct checkout functionality is needed in the future.
