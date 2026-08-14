# PostNord Delivery Tracking Integration

This document describes the PostNord integration for CircuCity's e-commerce platform, enabling shipment creation, tracking, and delivery management.

## Overview

The PostNord integration provides:
- **Shipment Creation**: Create shipments and generate shipping labels
- **Real-time Tracking**: Track packages with automatic status updates
- **Delivery Management**: Monitor delivery progress and events
- **Multi-carrier Support**: Ready to extend to other carriers

## Database Schema

### Shipment Model
Stores shipment information including tracking numbers, status, and delivery details.

**Key Fields:**
- `trackingNumber`: Unique PostNord tracking number
- `status`: Current shipment status (PENDING, IN_TRANSIT, DELIVERED, etc.)
- `estimatedDelivery`: Expected delivery date
- `actualDelivery`: Actual delivery timestamp
- `labelUrl`: URL to download shipping label PDF
- `postnordShipmentId`: PostNord's internal shipment ID

### TrackingEvent Model
Stores historical tracking events for each shipment.

**Key Fields:**
- `status`: Event status (e.g., "In Transit", "Out for Delivery")
- `description`: Detailed event description
- `location`: Location where event occurred
- `timestamp`: When the event occurred

## API Endpoints

### 1. Create Shipment
**POST** `/api/shipments`

Creates a new PostNord shipment for an order.

**Request Body:**
```json
{
  "orderId": "order_123",
  "serviceCode": "19",
  "weight": 1.5,
  "length": 30,
  "width": 20,
  "height": 10,
  "senderInfo": {
    "name": "My Shop",
    "address": "123 Main St",
    "city": "Stockholm",
    "postalCode": "11122",
    "countryCode": "SE",
    "phone": "+46123456789",
    "email": "shop@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "shipment": {
    "id": "shipment_123",
    "trackingNumber": "PNSE123456789",
    "labelUrl": "https://...",
    "estimatedDelivery": "2026-02-15T12:00:00Z"
  }
}
```

**Authorization:** Requires SELLER or ADMIN role

### 2. Get Shipments
**GET** `/api/shipments?orderId=order_123`

Retrieves all shipments for an order with tracking events.

**Response:**
```json
{
  "shipments": [
    {
      "id": "shipment_123",
      "trackingNumber": "PNSE123456789",
      "status": "IN_TRANSIT",
      "estimatedDelivery": "2026-02-15T12:00:00Z",
      "trackingEvents": [
        {
          "status": "Picked up",
          "description": "Package picked up by carrier",
          "location": "Stockholm",
          "timestamp": "2026-02-10T10:00:00Z"
        }
      ]
    }
  ]
}
```

**Authorization:** Order owner, SELLER, or ADMIN

### 3. Track Shipment
**GET** `/api/shipments/[trackingNumber]/track`

Fetches latest tracking information from PostNord and updates the database.

**Response:**
```json
{
  "shipment": {
    "id": "shipment_123",
    "trackingNumber": "PNSE123456789",
    "status": "IN_TRANSIT",
    "trackingEvents": [...]
  },
  "trackingInfo": {
    "trackingNumber": "PNSE123456789",
    "status": "In transit",
    "statusDescription": "Your package is on its way",
    "events": [...]
  }
}
```

**Authorization:** Order owner, SELLER, or ADMIN

## PostNord Service Codes

Common PostNord service types:

- **19**: MyPack Home (Standard Parcel to home address)
- **17**: MyPack Collect (Delivery to pickup point)
- **15**: Express Parcel (Next-day delivery)

For a complete list, refer to [PostNord Developer Documentation](https://developer.postnord.com/).

## UI Components

### ShipmentTracker
Displays tracking information for buyers.

**Usage:**
```tsx
import ShipmentTracker from '@/components/shipment/ShipmentTracker';

<ShipmentTracker orderId="order_123" />
```

**Features:**
- Timeline visualization of tracking events
- Real-time status updates
- Refresh button for latest tracking info
- Estimated and actual delivery dates

### CreateShipmentForm
Form for sellers to create shipments.

**Usage:**
```tsx
import CreateShipmentForm from '@/components/shipment/CreateShipmentForm';

<CreateShipmentForm 
  orderId="order_123"
  onShipmentCreated={() => {
    // Callback after shipment is created
  }}
/>
```

**Features:**
- Service selection (Standard, Pickup Point, Express)
- Package dimensions input
- Sender information form
- Automatic label download

## Environment Variables

Add these to your `.env.local` file:

```bash
# PostNord API Configuration
POSTNORD_API_KEY=your_api_key_here
POSTNORD_CUSTOMER_ID=your_customer_id_here
POSTNORD_ENVIRONMENT=sandbox  # or 'production'
```

### Getting PostNord Credentials

1. Visit [PostNord Developer Portal](https://developer.postnord.com/)
2. Create an account (Partner or Customer plan)
3. Generate API keys for sandbox/production
4. Note your Customer ID from the dashboard

## Setup Instructions

### 1. Database Migration
The schema has already been updated. If you need to reset:

```bash
npx prisma db push
npx prisma generate
```

### 2. Configure Environment Variables
Update `.env.local` with your PostNord credentials.

### 3. Test in Sandbox
Start with sandbox environment to test integration:

```bash
POSTNORD_ENVIRONMENT=sandbox
```

### 4. Integration Testing

**Create a test shipment:**
```bash
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "your_order_id",
    "serviceCode": "19",
    "weight": 1.0,
    "senderInfo": {
      "name": "Test Shop",
      "address": "Test Address 1",
      "city": "Stockholm",
      "postalCode": "11122",
      "countryCode": "SE"
    }
  }'
```

**Track a shipment:**
```bash
curl http://localhost:3000/api/shipments/PNSE123456789/track
```

## Workflow

### For Sellers (Creating Shipments)

1. **Order Received**: Customer places order with shipping address
2. **Create Shipment**: Seller uses `CreateShipmentForm` to create shipment
3. **Generate Label**: PostNord returns shipping label PDF
4. **Print & Ship**: Seller prints label and ships package
5. **Status Updates**: Order status automatically updates to SHIPPED

### For Buyers (Tracking Orders)

1. **View Order**: Navigate to order details page
2. **Track Shipment**: `ShipmentTracker` component displays tracking info
3. **Refresh Updates**: Click refresh to get latest tracking events
4. **Delivery Confirmation**: Automatic status update when delivered

## Status Mapping

PostNord statuses are mapped to our internal `ShipmentStatus` enum:

| PostNord Status | Internal Status | Description |
|----------------|-----------------|-------------|
| Picked up | PICKED_UP | Package collected by carrier |
| In transit | IN_TRANSIT | Package in transit |
| Out for delivery | OUT_FOR_DELIVERY | Package out for delivery |
| Delivered | DELIVERED | Successfully delivered |
| Delivery failed | FAILED_DELIVERY | Delivery attempt failed |
| Returned | RETURNED | Returned to sender |

## Error Handling

The integration includes comprehensive error handling:

- **API Errors**: PostNord API errors are caught and returned with details
- **Authentication**: Unauthorized requests return 401
- **Authorization**: Non-sellers attempting to create shipments return 403
- **Validation**: Missing required fields return 400 with error details
- **Not Found**: Invalid order/shipment IDs return 404

## Future Enhancements

Potential improvements:

1. **Webhook Integration**: Receive automatic tracking updates from PostNord
2. **Service Point Selection**: Allow customers to choose pickup points
3. **Multi-package Shipments**: Support splitting orders into multiple packages
4. **Return Labels**: Generate return shipping labels
5. **Cost Calculation**: Integrate PostNord pricing API
6. **Email Notifications**: Send tracking updates to customers
7. **SMS Notifications**: Send delivery notifications via SMS

## Troubleshooting

### "PostNord API credentials not configured"
- Ensure `POSTNORD_API_KEY` and `POSTNORD_CUSTOMER_ID` are set in `.env.local`
- Restart your development server after adding environment variables

### "Failed to create shipment"
- Check that the order has complete shipping information
- Verify sender information is complete and valid
- Ensure API key has correct permissions
- Check PostNord API status

### Tracking not updating
- Verify tracking number is correct
- Check that shipment exists in PostNord system
- Some events may take time to appear in PostNord's system
- Try refreshing after a few minutes

## Support

For PostNord API issues:
- [PostNord Developer Portal](https://developer.postnord.com/)
- [PostNord API Documentation](https://developer.postnord.com/api)
- Contact PostNord support for API-specific questions

## License

This integration is part of the CircuCity platform.
