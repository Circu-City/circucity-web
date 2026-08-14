# Complete Refund & Cancellation System

## ✅ What Happens When an Order is Cancelled/Refunded

### Automatic Refund Flow (via Stripe Webhook)

```
Customer receives refund in Stripe Dashboard
    ↓
Stripe sends charge.refunded webhook
    ↓
Webhook handler processes refund
    ↓
Order status → REFUNDED or PARTIALLY_REFUNDED
    ↓
Inventory restored (for full refunds)
    ↓
Product status updated (OUT_OF_STOCK → ACTIVE if applicable)
    ↓
Refund details saved to database
```

### Manual Cancellation Flow (via API)

```
User/Admin requests cancellation
    ↓
POST /api/orders/[orderId]/cancel
    ↓
Validates order can be cancelled
    ↓
Processes Stripe refund
    ↓
Order status → CANCELLED
    ↓
Inventory restored
    ↓
Product status updated
    ↓
Returns success response
```

## 🔧 What Was Implemented

### 1. Database Schema Updates

**Added to Order model:**
```prisma
// Cancellation & Refund Information
cancelledAt        DateTime?
cancellationReason String?
refundId           String?    // Stripe refund ID
refundAmount       Decimal?   // Amount refunded
stripeChargeId     String?    // For tracking refunds
```

**New Order Statuses:**
- `REFUNDED` - Full refund processed
- `PARTIALLY_REFUNDED` - Partial refund processed
- `DISPUTED` - Payment disputed (for future use)

### 2. Stripe Webhook Handler

**Enhanced:** `app/api/webhooks/stripe/route.ts`

**New Features:**
- ✅ Stores `stripeChargeId` when order is created
- ✅ Handles `charge.refunded` webhook event
- ✅ Detects full vs partial refunds
- ✅ Restores inventory for full refunds
- ✅ Updates product status (OUT_OF_STOCK → ACTIVE)
- ✅ Prevents duplicate processing
- ✅ Comprehensive logging

**Events Handled:**
- `checkout.session.completed` - Creates order
- `charge.refunded` - Processes refunds

### 3. Manual Cancellation API

**New Endpoint:** `POST /api/orders/[orderId]/cancel`

**Features:**
- ✅ User authentication required
- ✅ Validates user owns the order
- ✅ Checks if order can be cancelled
- ✅ Processes Stripe refund automatically
- ✅ Restores inventory
- ✅ Updates order status
- ✅ Returns detailed response

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "refundId": "re_xxxxx",
  "message": "Order cancelled successfully"
}
```

## 📊 Inventory Restoration Logic

### When Inventory is Restored:

✅ **Full Refund:**
- All items returned to inventory
- Product status updated if was OUT_OF_STOCK

❌ **Partial Refund:**
- Inventory NOT automatically restored
- Requires manual intervention

### Example:

**Before Refund:**
```
Product A: 5 units in stock
Order contains: 3 units of Product A
Product A status: ACTIVE
```

**After Order:**
```
Product A: 2 units in stock
Product A status: ACTIVE
```

**After Full Refund:**
```
Product A: 5 units in stock (restored)
Product A status: ACTIVE
```

**If Product Was Out of Stock:**
```
Before: Product A: 0 units, status: OUT_OF_STOCK
After refund: Product A: 3 units, status: ACTIVE ✅
```

## 🚫 Business Rules

### When Cancellation is Allowed:
✅ Order status is `PENDING` or `PAID`
✅ Order not yet `SHIPPED` or `DELIVERED`
✅ User owns the order (or is admin)

### When Cancellation is Denied:
❌ Order already `CANCELLED` or `REFUNDED`
❌ Order status is `SHIPPED` or `DELIVERED`
❌ User doesn't own the order

## 🧪 Testing

### Test Automatic Refund (Webhook)

1. **Create an order:**
   - Complete a test payment
   - Note the order ID

2. **Process refund in Stripe:**
   ```bash
   # Get the charge ID from Stripe Dashboard
   stripe refunds create --charge=ch_xxxxx
   ```

3. **Verify webhook processing:**
   - Check terminal logs for refund processing
   - Verify order status changed to `REFUNDED`
   - Check inventory was restored

4. **Check database:**
   ```bash
   npx prisma studio
   ```
   - Order status should be `REFUNDED`
   - `refundId` should be populated
   - `cancelledAt` should have timestamp

### Test Manual Cancellation (API)

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"reason": "Changed my mind"}'
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "clm123abc",
    "status": "CANCELLED",
    "cancelledAt": "2026-02-09T...",
    "cancellationReason": "Changed my mind"
  },
  "refundId": "re_xxxxx",
  "message": "Order cancelled successfully"
}
```

### Verify Inventory Restoration

**Before cancellation:**
```sql
SELECT id, name, inventory, status FROM Product WHERE id = 'PRODUCT_ID';
-- Result: inventory = 5, status = 'ACTIVE'
```

**After order (3 units):**
```sql
-- Result: inventory = 2, status = 'ACTIVE'
```

**After cancellation:**
```sql
-- Result: inventory = 5, status = 'ACTIVE' ✅
```

## 📝 Webhook Configuration

### Stripe Dashboard Setup

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `charge.refunded`
5. Copy signing secret to environment variables

### Local Testing

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events checkout.session.completed,charge.refunded

# Terminal 3: Trigger test refund
stripe trigger charge.refunded
```

## 🔍 Monitoring & Logs

### Successful Refund Logs:

```
=== CHARGE REFUNDED ===
Charge ID: ch_xxxxx
Amount refunded: 50.00
Fully refunded: true
Found order: clm123abc
✅ Order clm123abc status updated to REFUNDED

=== RESTORING INVENTORY ===
Restoring inventory for product clm456def, incrementing by 2
Product clm456def inventory after restoration: 10
✅ Inventory restored successfully
=== REFUND PROCESSING COMPLETE ===
```

### Error Scenarios:

**Order not found:**
```
❌ Order not found for charge: ch_xxxxx
```

**Already processed:**
```
ℹ️  Order already refunded/cancelled, skipping
```

**Inventory restoration failed:**
```
❌ Error restoring inventory for product clm456def: Product not found
```

## 🎯 Summary

### What Happens to Items When Order is Cancelled/Refunded:

1. **Order Status** → Changed to `CANCELLED` or `REFUNDED`
2. **Inventory** → Restored to original quantity
3. **Product Status** → Changed from `OUT_OF_STOCK` to `ACTIVE` if applicable
4. **Refund** → Money returned to customer via Stripe
5. **Database** → All details logged for audit trail

### Key Points:

✅ **Automatic** - Webhooks handle Stripe refunds automatically
✅ **Manual** - API endpoint for user/admin cancellations
✅ **Inventory Safe** - Items always returned to stock
✅ **Idempotent** - Safe to process multiple times
✅ **Logged** - Complete audit trail
✅ **Validated** - Business rules enforced

This ensures your inventory is always accurate and customers can properly cancel orders! 🎉
