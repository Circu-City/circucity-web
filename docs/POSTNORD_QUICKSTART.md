# PostNord Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get PostNord API Credentials
1. Visit https://developer.postnord.com/
2. Create an account (choose Partner or Customer plan)
3. Generate API keys for sandbox environment
4. Copy your API Key and Customer ID

### 2. Configure Environment Variables
Add to `.env.local`:
```bash
POSTNORD_API_KEY=your_api_key_here
POSTNORD_CUSTOMER_ID=your_customer_id_here
POSTNORD_ENVIRONMENT=sandbox
```

### 3. Restart Development Server
```bash
npm run dev
```

## 📦 Usage Examples

### For Buyers - Track Your Order

Add to your order details page:
```tsx
import ShipmentTracker from '@/components/shipment/ShipmentTracker';

<ShipmentTracker orderId={orderId} />
```

### For Sellers - Create Shipment

Add to your seller dashboard:
```tsx
import CreateShipmentForm from '@/components/shipment/CreateShipmentForm';

<CreateShipmentForm 
  orderId={orderId}
  onShipmentCreated={() => {
    // Refresh page or show success message
  }}
/>
```

## 🔧 API Usage

### Create a Shipment
```typescript
const response = await fetch('/api/shipments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'order_123',
    serviceCode: '19', // Standard parcel
    weight: 1.5, // kg
    senderInfo: {
      name: 'My Shop',
      address: '123 Main St',
      city: 'Stockholm',
      postalCode: '11122',
      countryCode: 'SE'
    }
  })
});

const { shipment } = await response.json();
console.log('Tracking number:', shipment.trackingNumber);
```

### Get Tracking Info
```typescript
const response = await fetch(`/api/shipments?orderId=${orderId}`);
const { shipments } = await response.json();
```

### Refresh Tracking
```typescript
const response = await fetch(`/api/shipments/${trackingNumber}/track`);
const { shipment, trackingInfo } = await response.json();
```

## 📊 Database Schema

### Shipment
- `trackingNumber` - PostNord tracking number
- `status` - Current status (PENDING, IN_TRANSIT, DELIVERED, etc.)
- `estimatedDelivery` - Expected delivery date
- `labelUrl` - Shipping label PDF URL

### TrackingEvent
- `status` - Event status
- `description` - Event description
- `location` - Where it happened
- `timestamp` - When it happened

## 🎯 Common Service Codes

- `19` - MyPack Home (standard to home)
- `17` - MyPack Collect (pickup point)
- `15` - Express Parcel (next-day)

## ✅ Checklist

- [ ] PostNord account created
- [ ] API credentials added to `.env.local`
- [ ] Development server restarted
- [ ] Database schema updated (`npx prisma db push`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Test shipment created successfully
- [ ] Tracking component displays correctly

## 🐛 Troubleshooting

**"PostNord API credentials not configured"**
→ Add credentials to `.env.local` and restart server

**"Only sellers can create shipments"**
→ Ensure your user has SELLER or ADMIN role

**"Order missing shipping information"**
→ Order must have complete shipping address

**Tracking not updating**
→ Click refresh button or wait a few minutes for PostNord to process

## 📚 Full Documentation

See `POSTNORD_INTEGRATION.md` for complete documentation.

## 🎨 Example Implementation

See `EXAMPLE_ORDER_PAGE.tsx` for a complete order details page example.

## 🔗 Useful Links

- [PostNord Developer Portal](https://developer.postnord.com/)
- [PostNord API Docs](https://developer.postnord.com/api)
- [PostNord Service Codes](https://developer.postnord.com/docs/services)

---

**Need Help?** Check the full documentation in `POSTNORD_INTEGRATION.md`
