# PostNord Integration Remediation Plan

## 🚨 Issue Identification

The current implementation in `lib/postnord.ts` attempts to use an endpoint structure that appears to be outdated or incorrect for the modern PostNord architecture:
- **Current Endpoint**: `/rest/businesscustomer/v1/shipment`
- **Status**: This endpoint is not referenced in the current [PostNord Developer Portal](https://developer.postnord.com/api/docs/location-and-booking-apis/booking-api) documentation for creating shipments.

## 🛠️ Required Fixes

To successfully create shipping labels, the integration must be migrated to the **Booking API**.

### 1. Update API Endpoint

Switch the base URL and endpoint to the correct Booking API version (likely v3 or v5 depending on specific region availability, but v3 is standard for international).

- **New Endpoint**: `https://api2.postnord.com/rest/shipment/v3/orders` (or `v5/orders`)

### 2. Update Request Payload

The Booking API requires a strict hierarchical structure. The current flat properties (like `sender`, `recipient`) need to be mapped to the Booking API schema.

**New JSON Structure (Example):**
```json
{
  "consignor": {
    "customerNumber": "YOUR_CUSTOMER_NUMBER",
    "name": "Sender Name",
    "address": { ... }
  },
  "consignee": {
    "name": "Recipient Name",
    "address": { ... }
  },
  "service": {
    "code": "19", // Service Code (e.g. MyPack Home)
    "basicService": true // Required for some services
  },
  "parcels": [
    {
      "weight": 1.5,
      "copies": 1
    }
  ],
  "printMedia": "PDF" // Essential for receiving a URL immediately
}
```

### 3. API Key Scope Verification

Ensure your API Key has the **"Booking"** scope enabled in the PostNord Developer Portal. Keys generated for "Tracking" or "Service Points" often do **not** have permission to create bookings.

## 📝 Implementation Steps

1.  **Verify Access**: Log in to the [PostNord Developer Portal](https://developer.postnord.com/).
2.  **Check Documentation**: Navigate to **Location and Booking APIs** > **Booking API**.
3.  **Refactor `lib/postnord.ts`**:
    *   Change the `createShipment` method to POST to `/rest/shipment/v3/orders`.
    *   Update the payload construction to match the "Booking" schema.
4.  **Test**: precise payload validation is strict. Use the "Try it out" feature on the portal to validate your JSON before updating the code.

## ⚠️ Important Considerations

*   **Customer Number**: This is distinct from your API Key. It is your contractual PostNord account number (often 10 digits).
*   **EDI Flow**: The Booking API triggers an EDI transmission. Ensure you are ready to ship when you call this, or use a "stored" status if you want to modify it later.
*   **Label Format**: Explicitly request `printMedia: "laser-ste"` or `PDF` to get a printable link/blob in the response.
