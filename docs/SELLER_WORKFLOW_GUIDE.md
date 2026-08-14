# Seller Workflow: From Payment to Delivery

This document explains the complete workflow for sellers after a buyer makes a payment on CircuCity.

## 📋 Overview

When a buyer completes payment, the seller needs to:
1. **View the paid order**
2. **Create a shipment** (generates shipping label)
3. **Ship the package** (using the PostNord label)
4. **Track delivery** (automatic updates)

---

## 🔄 Complete Workflow

### Step 1: Buyer Makes Payment

**What happens:**
- Buyer completes checkout with Stripe
- Order status changes from `PENDING` → `PAID`
- Seller receives notification (order appears in their dashboard)

**Where to check:**
- Navigate to **Dashboard → Seller → Orders**
- Look for orders with green `PAID` badge

---

### Step 2: Seller Views Paid Order

**How to access:**
1. Go to `/dashboard/seller/orders`
2. Find the order with status `PAID`
3. You'll see a blue **"Create Shipment"** button

**What you see:**
- Customer name and email
- Shipping address
- Items ordered from your shop
- Your earnings from this order
- **Action Required**: Create Shipment button

---

### Step 3: Create Shipment

**How to create:**
1. Click **"Create Shipment"** or **"Details"** button
2. You'll be taken to the order details page
3. Fill out the **Create Shipment Form**:

   **Required Information:**
   - **Service Type**: Choose shipping method
     - Standard Parcel (MyPack Home)
     - Pickup Point (MyPack Collect)
     - Express Parcel
   
   - **Package Details:**
     - Weight (kg) - Required
     - Dimensions (length, width, height) - Optional
   
   - **Sender Information:**
     - Your name/shop name
     - Your warehouse/shop address
     - City, postal code, country
     - Contact phone and email

4. Click **"Create Shipment"**

**What happens:**
- PostNord API creates the shipment
- Shipping label PDF is generated
- Label opens in new tab automatically
- Order status changes to `SHIPPED`
- Tracking number is saved
- Buyer can now track their package

---

### Step 4: Print Label & Ship Package

**After creating shipment:**
1. **Download/Print** the shipping label PDF
2. **Attach label** to your package
3. **Drop off package** at PostNord location or schedule pickup
4. Package is now in PostNord's system

**PostNord will:**
- Scan the package when picked up
- Update tracking status automatically
- Deliver to customer's address

---

### Step 5: Track Delivery

**Monitoring shipment:**
1. Go to `/dashboard/seller/orders`
2. Orders with shipments show **"View Tracking"** button (green)
3. Click to see real-time tracking information

**Tracking information includes:**
- Current status (In Transit, Out for Delivery, etc.)
- Estimated delivery date
- Tracking events timeline with locations
- Actual delivery timestamp (when delivered)

**Status progression:**
```
PENDING → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
```

**When delivered:**
- Order status automatically updates to `DELIVERED`
- Buyer is notified
- Transaction is complete

---

## 🖥️ User Interface Guide

### Seller Orders Page (`/dashboard/seller/orders`)

**Table Columns:**
- **Order ID**: Shortened order identifier
- **Customer**: Buyer name, email, shipping location
- **Status**: Order status badge (PAID, SHIPPED, DELIVERED)
- **Items**: Products from your shop in this order
- **Total**: Your earnings from this order
- **Date**: When order was placed
- **Actions**: Action buttons

**Action Buttons:**
- 🔵 **Create Shipment** - For PAID orders without shipments
- 🟢 **View Tracking** - For orders with active shipments
- ⚪ **Details** - View full order details (always available)

---

### Order Details Page (`/dashboard/seller/orders/[id]`)

**Sections:**

1. **Order Header**
   - Order ID and status badge
   - Quick overview

2. **Your Items in This Order**
   - Products from your shop
   - Quantities and prices
   - Your total earnings

3. **Action Required Banner** (for PAID orders)
   - Blue alert box
   - Prompts you to create shipment
   - Explains next steps

4. **Create Shipment Form** (for PAID orders without shipments)
   - Service selection dropdown
   - Package details inputs
   - Sender information form
   - Submit button

5. **Shipment Tracking** (for orders with shipments)
   - Tracking timeline
   - Status updates
   - Delivery information
   - Refresh button

6. **Sidebar Information**
   - Order summary
   - Customer information
   - Shipping address

---

## 📱 Buyer Experience

**What buyers see:**

1. **After Payment**
   - Order confirmation page
   - Order appears in their dashboard
   - Status: `PAID`

2. **After Seller Creates Shipment**
   - Order status updates to `SHIPPED`
   - Tracking information appears
   - Can view delivery timeline
   - Receives tracking number

3. **During Delivery**
   - Can track package in real-time
   - See current location and status
   - View estimated delivery date
   - Refresh for latest updates

4. **After Delivery**
   - Order status: `DELIVERED`
   - Can view delivery confirmation
   - Transaction complete

---

## 🔑 Key Points for Sellers

### ✅ DO:
- ✅ Check your orders dashboard regularly for new PAID orders
- ✅ Create shipments promptly after receiving payment
- ✅ Provide accurate package dimensions for proper shipping costs
- ✅ Use correct sender address (your warehouse/shop location)
- ✅ Print and attach the shipping label securely
- ✅ Drop off packages at PostNord within 24-48 hours
- ✅ Monitor tracking to ensure successful delivery

### ❌ DON'T:
- ❌ Don't ship without creating a shipment in the system
- ❌ Don't use your own shipping labels (use PostNord labels)
- ❌ Don't forget to print the label before shipping
- ❌ Don't provide incorrect shipping information
- ❌ Don't delay shipment creation - buyers are waiting!

---

## 🚨 Troubleshooting

### "Create Shipment" button not showing
- **Check**: Is the order status `PAID`?
- **Check**: Have you already created a shipment for this order?
- **Solution**: Only PAID orders without shipments show this button

### Shipping label not downloading
- **Check**: Is your popup blocker enabled?
- **Solution**: Allow popups for this site
- **Alternative**: Check the shipment details page for label URL

### Wrong shipping address
- **Issue**: Customer provided incorrect address
- **Solution**: Contact customer to update address before shipping
- **Note**: Address comes from buyer's checkout information

### Package not picked up by PostNord
- **Check**: Did you drop it at the correct PostNord location?
- **Check**: Is the label attached and visible?
- **Solution**: Contact PostNord customer service

### Tracking not updating
- **Reason**: PostNord may take time to scan packages
- **Solution**: Wait a few hours and click "Refresh"
- **Note**: Initial scan happens when PostNord picks up the package

---

## 📊 Order Status Reference

| Status | Meaning | Seller Action Required |
|--------|---------|----------------------|
| `PENDING` | Payment not completed | Wait for payment |
| `PAID` | Payment received | **CREATE SHIPMENT** |
| `SHIPPED` | Shipment created | Ship the package |
| `DELIVERED` | Package delivered | None - Complete! |
| `CANCELLED` | Order cancelled | None |
| `REFUNDED` | Payment refunded | None |

---

## 💡 Tips for Success

1. **Fast Shipping = Happy Customers**
   - Create shipments within 24 hours of payment
   - Ship packages same day or next day

2. **Accurate Information**
   - Double-check shipping addresses
   - Provide correct package weights
   - Use your real business address

3. **Communication**
   - Buyers can see tracking updates automatically
   - No need to manually notify them
   - System handles all notifications

4. **Quality Packaging**
   - Pack items securely
   - Use appropriate box size
   - Attach label clearly on outside

5. **Track Everything**
   - Monitor your shipments
   - Check for delivery confirmation
   - Address any delivery issues promptly

---

## 🔗 Quick Links

- **Seller Orders**: `/dashboard/seller/orders`
- **PostNord Developer Portal**: https://developer.postnord.com/
- **PostNord Service Points**: Find nearest drop-off location
- **Support**: Contact CircuCity support for platform issues

---

## 📞 Support

**For platform/technical issues:**
- Contact CircuCity support

**For shipping/delivery issues:**
- Contact PostNord customer service
- Use tracking number for reference

**For payment issues:**
- Check Stripe dashboard
- Contact CircuCity support

---

## Summary

**The complete flow in 4 steps:**

1. 💰 **Buyer pays** → Order status: `PAID`
2. 📦 **Seller creates shipment** → Label generated, Order status: `SHIPPED`
3. 🚚 **Seller ships package** → PostNord picks up and delivers
4. ✅ **Package delivered** → Order status: `DELIVERED`, Transaction complete!

**Your responsibility as a seller:**
- Monitor paid orders
- Create shipments promptly
- Ship packages with PostNord labels
- Ensure timely delivery

The platform handles everything else automatically! 🎉
