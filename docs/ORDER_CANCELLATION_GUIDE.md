# Order Cancellation & Refund Flow

## What Should Happen When an Order is Cancelled/Refunded

### Standard E-Commerce Practice:

When a customer cancels an order or receives a refund:

1. ✅ **Update Order Status** → Change from `PAID` to `CANCELLED`
2. ✅ **Restore Inventory** → Add items back to stock
3. ✅ **Process Refund** → Return money to customer (via Stripe)
4. ✅ **Update Product Status** → If product was `OUT_OF_STOCK`, change back to `ACTIVE`
5. ✅ **Notify Customer** → Send cancellation/refund confirmation email
6. ✅ **Record Transaction** → Keep audit trail of the cancellation

## Current Implementation Status

### ❌ What's Missing:
- No webhook handler for Stripe refund events
- No inventory restoration logic
- No order cancellation endpoint
- No refund processing

### ✅ What We'll Implement:

1. **Stripe Webhook Handler** for refund events
2. **Order Cancellation API** endpoint
3. **Inventory Restoration** logic
4. **Admin/User Cancellation** interface

## Scenarios to Handle

### Scenario 1: Customer Requests Cancellation (Before Shipping)
```
Customer requests cancellation
    ↓
Admin/System approves
    ↓
Stripe refund initiated
    ↓
Webhook receives charge.refunded event
    ↓
Order status → CANCELLED
    ↓
Inventory restored
    ↓
Customer notified
```

### Scenario 2: Admin Cancels Order
```
Admin cancels order in dashboard
    ↓
API endpoint called
    ↓
Stripe refund processed
    ↓
Order status → CANCELLED
    ↓
Inventory restored
    ↓
Customer notified
```

### Scenario 3: Payment Dispute/Chargeback
```
Customer disputes charge
    ↓
Stripe sends charge.dispute.created webhook
    ↓
Order status → DISPUTED (new status)
    ↓
Inventory held (not restored yet)
    ↓
Admin investigates
```

## Implementation Details

### Database Changes Needed:

**Add to Order model:**
- `cancelledAt` - Timestamp of cancellation
- `cancellationReason` - Why it was cancelled
- `refundId` - Stripe refund ID
- `refundAmount` - Amount refunded (for partial refunds)

**Add new OrderStatus:**
- `REFUNDED` - Full refund processed
- `PARTIALLY_REFUNDED` - Partial refund
- `DISPUTED` - Payment disputed

### Inventory Restoration Logic:

```typescript
// When order is cancelled:
for each item in order {
    1. Increment product inventory by item.quantity
    2. If product.status === 'OUT_OF_STOCK' && inventory > 0:
       → Set product.status = 'ACTIVE'
}
```

### Important Considerations:

1. **Idempotency** - Handle duplicate webhook events
2. **Partial Refunds** - Support refunding only some items
3. **Time Limits** - Set cancellation window (e.g., 24 hours)
4. **Stock Validation** - Ensure inventory doesn't go negative
5. **Audit Trail** - Log all cancellations and refunds

## Stripe Webhook Events to Handle

### Primary Events:
- `charge.refunded` - Full or partial refund processed
- `charge.dispute.created` - Customer disputed charge
- `charge.dispute.closed` - Dispute resolved

### Event Data Structure:
```json
{
  "type": "charge.refunded",
  "data": {
    "object": {
      "id": "ch_xxx",
      "amount": 5000,
      "amount_refunded": 5000,
      "refunded": true,
      "metadata": {
        "orderId": "clm123abc"
      }
    }
  }
}
```

## Business Rules

### When to Allow Cancellation:
✅ Order status is `PAID` or `PENDING`
✅ Order not yet shipped
✅ Within cancellation window (e.g., 24 hours)

### When to Deny Cancellation:
❌ Order already `SHIPPED` or `DELIVERED`
❌ Outside cancellation window
❌ Already `CANCELLED` or `REFUNDED`

### Inventory Restoration Rules:
✅ Restore full quantity for full refund
✅ Restore partial quantity for partial refund
✅ Don't restore if product deleted
✅ Update product status if was out of stock

## Next Steps

I'll implement:
1. ✅ Enhanced webhook handler for refunds
2. ✅ Order cancellation API endpoint
3. ✅ Inventory restoration logic
4. ✅ Database schema updates
5. ✅ Admin cancellation interface (optional)

This ensures your inventory stays accurate and customers can properly cancel orders!
