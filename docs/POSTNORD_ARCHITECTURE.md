# PostNord Integration Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CircuCity Platform                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Buyer UI   │         │  Seller UI   │         │  Admin UI    │
│              │         │              │         │              │
│ - Track      │         │ - Create     │         │ - Manage     │
│   Orders     │         │   Shipments  │         │   All        │
│ - View       │         │ - Download   │         │   Shipments  │
│   Timeline   │         │   Labels     │         │              │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   React Components    │
                    ├───────────────────────┤
                    │ ShipmentTracker       │
                    │ CreateShipmentForm    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    API Endpoints      │
                    ├───────────────────────┤
                    │ POST /api/shipments   │
                    │ GET  /api/shipments   │
                    │ GET  .../track        │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  PostNord Client      │
                    │  (lib/postnord.ts)    │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
    ┌───────────▼───────┐   ┌──▼──────┐   ┌───▼────────┐
    │  PostNord API     │   │Database │   │   Stripe   │
    │                   │   │(Prisma) │   │  Payment   │
    │ - Create Shipment │   │         │   │            │
    │ - Track Shipment  │   │Shipment │   │   Order    │
    │ - Get Label       │   │Tracking │   │  Status    │
    └───────────────────┘   │ Event   │   └────────────┘
                            └─────────┘
```

## Data Flow

### Creating a Shipment

```
Seller Dashboard
    │
    │ 1. Fill form with package details
    ▼
CreateShipmentForm
    │
    │ 2. POST /api/shipments
    ▼
API Endpoint
    │
    │ 3. Validate order & permissions
    ├─► Check user is SELLER/ADMIN
    ├─► Verify shipping address exists
    │
    │ 4. Call PostNord API
    ▼
PostNord Client
    │
    │ 5. Create shipment
    ▼
PostNord API
    │
    │ 6. Return tracking number & label
    ▼
API Endpoint
    │
    │ 7. Save to database
    ├─► Create Shipment record
    ├─► Update Order status to SHIPPED
    │
    │ 8. Return response
    ▼
CreateShipmentForm
    │
    │ 9. Download label PDF
    │ 10. Show success message
    ▼
Seller sees confirmation
```

### Tracking a Shipment

```
Buyer/Seller Dashboard
    │
    │ 1. View order details
    ▼
ShipmentTracker
    │
    │ 2. GET /api/shipments?orderId=xxx
    ▼
API Endpoint
    │
    │ 3. Fetch from database
    ├─► Get Shipment records
    ├─► Get TrackingEvent records
    │
    │ 4. Return shipments
    ▼
ShipmentTracker
    │
    │ 5. Display timeline
    │
    │ 6. User clicks "Refresh"
    ▼
ShipmentTracker
    │
    │ 7. GET /api/shipments/{tracking}/track
    ▼
API Endpoint
    │
    │ 8. Call PostNord API
    ▼
PostNord Client
    │
    │ 9. Get latest tracking info
    ▼
PostNord API
    │
    │ 10. Return tracking events
    ▼
API Endpoint
    │
    │ 11. Update database
    ├─► Update Shipment status
    ├─► Create new TrackingEvents
    ├─► Update Order status if delivered
    │
    │ 12. Return updated data
    ▼
ShipmentTracker
    │
    │ 13. Update timeline display
    ▼
User sees latest tracking info
```

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                         Order                           │
├─────────────────────────────────────────────────────────┤
│ id: String (PK)                                         │
│ userId: String (FK → User)                              │
│ status: OrderStatus                                     │
│ total: Decimal                                          │
│ shippingName: String                                    │
│ shippingAddressLine1: String                            │
│ shippingCity: String                                    │
│ shippingPostalCode: String                              │
│ shippingCountry: String                                 │
│ createdAt: DateTime                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ 1:N
                 │
┌────────────────▼────────────────────────────────────────┐
│                       Shipment                          │
├─────────────────────────────────────────────────────────┤
│ id: String (PK)                                         │
│ orderId: String (FK → Order)                            │
│ trackingNumber: String (UNIQUE)                         │
│ carrier: String (default: "PostNord")                   │
│ status: ShipmentStatus                                  │
│ estimatedDelivery: DateTime?                            │
│ actualDelivery: DateTime?                               │
│ recipientName: String                                   │
│ recipientAddress: String                                │
│ recipientCity: String                                   │
│ recipientPostalCode: String                             │
│ recipientCountry: String                                │
│ weight: Float?                                          │
│ postnordShipmentId: String?                             │
│ labelUrl: String?                                       │
│ createdAt: DateTime                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ 1:N
                 │
┌────────────────▼────────────────────────────────────────┐
│                    TrackingEvent                        │
├─────────────────────────────────────────────────────────┤
│ id: String (PK)                                         │
│ shipmentId: String (FK → Shipment)                      │
│ status: String                                          │
│ description: String?                                    │
│ location: String?                                       │
│ timestamp: DateTime                                     │
│ createdAt: DateTime                                     │
└─────────────────────────────────────────────────────────┘
```

## Status Flow

```
Order Status Flow:
PENDING → PAID → SHIPPED → DELIVERED
                    ↑
                    │
            When shipment created

Shipment Status Flow:
PENDING → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
   │
   ├─► FAILED_DELIVERY → (retry or RETURNED)
   │
   └─► CANCELLED
```

## Component Hierarchy

```
OrderDetailsPage
│
├─► OrderHeader
│   └─► Order ID, Status
│
├─► OrderItems
│   └─► Product list with images
│
├─► ShipmentTracker (if shipments exist)
│   │
│   ├─► ShipmentCard (for each shipment)
│   │   │
│   │   ├─► StatusBadge
│   │   ├─► DeliveryInfo
│   │   ├─► RefreshButton
│   │   │
│   │   └─► TrackingTimeline
│   │       └─► TrackingEvent (for each event)
│   │           ├─► StatusIcon
│   │           ├─► Description
│   │           ├─► Location
│   │           └─► Timestamp
│   │
│   └─► EmptyState (if no shipments)
│
└─► CreateShipmentForm (if seller & no shipments)
    │
    ├─► ServiceSelector
    ├─► PackageDimensionsInput
    ├─► SenderInformationForm
    └─► SubmitButton
```

## API Authentication & Authorization

```
Request Flow:
    │
    ├─► Authentication (Clerk)
    │   └─► Check if user is logged in
    │       ├─► Yes → Continue
    │       └─► No → 401 Unauthorized
    │
    ├─► Authorization
    │   │
    │   ├─► For POST /api/shipments:
    │   │   └─► Check if user is SELLER or ADMIN
    │   │       ├─► Yes → Continue
    │   │       └─► No → 403 Forbidden
    │   │
    │   └─► For GET endpoints:
    │       └─► Check if user owns order OR is SELLER/ADMIN
    │           ├─► Yes → Continue
    │           └─► No → 403 Forbidden
    │
    └─► Process Request
```

## Environment Configuration

```
Development:
    POSTNORD_ENVIRONMENT=sandbox
    POSTNORD_API_KEY=sandbox_key_xxx
    │
    └─► Uses: https://api2-stage.postnord.com

Production:
    POSTNORD_ENVIRONMENT=production
    POSTNORD_API_KEY=prod_key_xxx
    │
    └─► Uses: https://api2.postnord.com
```

## Error Handling

```
Error Flow:
    │
    ├─► Client Error (4xx)
    │   ├─► 400 Bad Request → Missing/invalid data
    │   ├─► 401 Unauthorized → Not logged in
    │   ├─► 403 Forbidden → No permission
    │   └─► 404 Not Found → Resource doesn't exist
    │
    ├─► Server Error (5xx)
    │   ├─► 500 Internal Error → Unexpected error
    │   └─► PostNord API Error → External service issue
    │
    └─► UI Handling
        ├─► Show error message
        ├─► Log to console
        └─► Allow retry
```

---

This architecture provides a robust, scalable solution for delivery tracking
with clear separation of concerns and proper error handling.
