# Payment Distribution: Sellers & Platform Owners

## 📊 Current State (What's Implemented)

### Current Payment Flow:

```
Buyer pays $100
    ↓
Stripe processes payment
    ↓
💰 ALL $100 goes to YOUR Stripe account (platform owner)
    ↓
Order created in database
    ↓
❌ Seller gets: $0 (no payout system exists)
❌ You keep: $100 (but you owe the seller!)
```

### What's Missing:

**NO seller payout system is currently implemented.** The database tracks:
- ✅ Orders and order items
- ✅ Which products were sold
- ✅ Which shop/seller owns each product
- ❌ **But NO tracking of:**
  - Platform commission/fees
  - Seller earnings
  - Payout status
  - Payout history

---

## 🎯 The Problem You Need to Solve

You're running a **multi-vendor marketplace** (like Etsy, Shopify, or Amazon Marketplace), which means:

1. **Multiple sellers** list products on your platform
2. **Buyers** purchase from different sellers
3. **You (platform)** need to:
   - Take a commission (e.g., 10% of each sale)
   - Pay sellers their share (e.g., 90% of each sale)
   - Handle the money flow securely and legally

### Example Scenario:

```
Seller A lists a product for $100
Buyer purchases it
    ↓
Who gets what?
├─ Seller A should get: $90 (90%)
└─ Platform (you) should get: $10 (10% commission)

But currently:
├─ Platform gets: $100 ❌
└─ Seller gets: $0 ❌
```

---

## 💡 Solution Options

### **Option 1: Stripe Connect (Recommended for Marketplaces)**

This is the **industry-standard solution** used by major platforms.

#### How It Works:

**1. Seller Onboarding:**
```
Seller signs up on your platform
    ↓
Clicks "Become a Seller"
    ↓
Redirected to Stripe Connect onboarding
    ↓
Seller provides:
├─ Business/personal information
├─ Bank account details
├─ Tax information (Stripe handles)
└─ Identity verification
    ↓
Stripe creates a "Connected Account" for seller
    ↓
Seller is now ready to receive payments
```

**2. When a Buyer Purchases:**

**Approach A: Application Fee (Simplest)**
```
Buyer pays $100
    ↓
Stripe processes payment
    ↓
Automatic split:
├─ $90 → Seller's Stripe account (instantly)
└─ $10 → Your Stripe account (your commission)
    ↓
Stripe automatically pays out:
├─ Seller: $90 to their bank (daily/weekly)
└─ You: $10 to your bank (daily/weekly)
```

**Approach B: Separate Charges & Transfers**
```
Buyer pays $100
    ↓
Money goes to YOUR Stripe account
    ↓
You manually trigger transfer:
├─ Transfer $90 to Seller's Stripe account
└─ Keep $10 as commission
    ↓
Stripe pays out to bank accounts
```

#### Database Changes Needed:

```prisma
model Shop {
  // ... existing fields
  
  // Stripe Connect fields
  stripeAccountId      String?  // Seller's Stripe Connect account ID
  stripeAccountStatus  String?  // 'pending', 'active', 'restricted'
  payoutsEnabled       Boolean  @default(false)
  chargesEnabled       Boolean  @default(false)
}

model Order {
  // ... existing fields
  
  // Payment split tracking
  platformFee          Decimal?  @db.Decimal(10, 2)  // Your commission
  sellerEarnings       Decimal?  @db.Decimal(10, 2)  // Seller's share
  stripeTransferId     String?   // Transfer ID if using transfers
}

model Payout {
  id                String   @id @default(cuid())
  shopId            String
  shop              Shop     @relation(fields: [shopId], references: [id])
  
  amount            Decimal  @db.Decimal(10, 2)
  status            String   // 'pending', 'paid', 'failed'
  stripePayoutId    String?  // Stripe payout ID
  
  // Which orders are included in this payout
  orders            Order[]
  
  createdAt         DateTime @default(now())
  paidAt            DateTime?
}
```

#### Implementation Steps:

1. **Integrate Stripe Connect:**
   - Add Stripe Connect onboarding flow
   - Store seller's `stripeAccountId` in database
   - Verify seller's account is active

2. **Modify Checkout:**
   - When creating Stripe session, specify:
     - Destination account (seller's Stripe account)
     - Application fee (your commission)
   
3. **Automatic Payouts:**
   - Stripe handles everything
   - Sellers get paid automatically
   - You get your commission automatically

#### Pros:
- ✅ **Fully automated** - No manual work
- ✅ **Secure** - Stripe handles all money movement
- ✅ **Compliant** - Tax forms, regulations handled
- ✅ **Scalable** - Works with 1 or 10,000 sellers
- ✅ **Trusted** - Used by Shopify, Etsy, Uber, Airbnb
- ✅ **Real-time** - Sellers can see earnings instantly
- ✅ **Dispute handling** - Stripe manages chargebacks

#### Cons:
- ⚠️ **Complex setup** - Requires significant development
- ⚠️ **Additional fees** - Stripe charges ~0.25% extra for Connect
- ⚠️ **Seller friction** - Sellers must complete onboarding
- ⚠️ **Verification delays** - Can take days for seller approval

#### Cost Example:
```
Sale: $100
Stripe processing fee: $3.20 (2.9% + $0.30)
Stripe Connect fee: $0.25 (0.25% of $100)
Total fees: $3.45

Distribution:
├─ Seller receives: $90 - $3.45 = $86.55
└─ Platform keeps: $10
```

---

### **Option 2: Manual Payouts (Simple but Labor-Intensive)**

Track earnings in your database and manually pay sellers.

#### How It Works:

**1. Track Earnings:**
```
When order is created:
├─ Calculate: sellerEarnings = orderTotal * 0.90
├─ Calculate: platformFee = orderTotal * 0.10
└─ Store in database with status = 'pending'
```

**2. Periodic Payouts (e.g., every Friday):**
```
You run a script/query:
├─ Find all pending earnings for each seller
├─ Sum up total owed to each seller
└─ Generate payout report

Example:
Seller A: $450 owed (from 5 orders)
Seller B: $270 owed (from 3 orders)
```

**3. Manual Payment:**
```
You manually:
├─ Log into your bank
├─ Transfer $450 to Seller A's bank account
├─ Transfer $270 to Seller B's bank account
├─ Update database: mark as 'paid'
└─ Send email receipts to sellers
```

#### Database Changes Needed:

```prisma
model Shop {
  // ... existing fields
  
  // Payout information
  bankAccountName   String?
  bankAccountNumber String?  // Encrypted!
  bankRoutingNumber String?  // Encrypted!
  paypalEmail       String?
  preferredPayoutMethod String?  // 'bank', 'paypal', 'check'
}

model Order {
  // ... existing fields
  
  platformFee       Decimal  @db.Decimal(10, 2)
  sellerEarnings    Decimal  @db.Decimal(10, 2)
  payoutStatus      String   @default('pending')  // 'pending', 'paid'
  paidAt            DateTime?
}

model PayoutBatch {
  id          String   @id @default(cuid())
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  
  totalAmount Decimal  @db.Decimal(10, 2)
  orderIds    String[] // List of order IDs included
  status      String   // 'pending', 'processing', 'completed', 'failed'
  method      String   // 'bank_transfer', 'paypal', 'check'
  
  createdAt   DateTime @default(now())
  paidAt      DateTime?
  notes       String?
}
```

#### Implementation Steps:

1. **Seller Setup:**
   - Add "Bank Account" settings page
   - Sellers enter their bank details
   - **IMPORTANT:** Encrypt sensitive data!

2. **Order Processing:**
   - When order is created, calculate splits:
     ```
     platformFee = total * 0.10
     sellerEarnings = total * 0.90
     ```

3. **Payout Dashboard:**
   - Admin page showing:
     - Pending payouts per seller
     - Total owed
     - Payout history

4. **Manual Process:**
   - Weekly/monthly: Export payout report
   - Manually transfer money
   - Mark orders as paid

#### Pros:
- ✅ **Simple to start** - No complex integration
- ✅ **Full control** - You decide when/how to pay
- ✅ **No extra fees** - Just standard bank transfer fees
- ✅ **Flexible** - Can negotiate custom terms

#### Cons:
- ❌ **Time-consuming** - Hours of work per payout cycle
- ❌ **Error-prone** - Easy to make mistakes
- ❌ **Delayed payments** - Sellers wait weeks for money
- ❌ **Doesn't scale** - Impossible with 100+ sellers
- ❌ **Security risk** - You handle sensitive bank data
- ❌ **Trust issues** - Sellers must trust you
- ❌ **Accounting nightmare** - Manual reconciliation

---

### **Option 3: Hybrid Approach (Stripe Transfers)**

Use Stripe to handle transfers, but you control timing.

#### How It Works:

**1. Seller Setup:**
```
Seller connects Stripe account (simplified onboarding)
OR
Seller provides bank account → You create Stripe recipient
```

**2. When Buyer Pays:**
```
Buyer pays $100
    ↓
ALL money goes to YOUR Stripe account
    ↓
Database tracks:
├─ Seller A is owed: $90
└─ Platform earned: $10
```

**3. Scheduled Payouts:**
```
Every Friday (automated script):
├─ Query database for pending earnings
├─ Use Stripe Transfer API:
    stripe.transfers.create({
      amount: 9000,  // $90 in cents
      currency: 'usd',
      destination: 'acct_SellerStripeID',
    })
├─ Update database: mark as paid
└─ Send notification to seller
```

#### Pros:
- ✅ **Automated transfers** - Stripe handles movement
- ✅ **You control timing** - Pay weekly/monthly
- ✅ **Secure** - Stripe manages bank details
- ✅ **Scalable** - API handles bulk transfers

#### Cons:
- ⚠️ **Still requires Connect** - Sellers need Stripe accounts
- ⚠️ **You hold funds** - Regulatory implications
- ⚠️ **Delayed payouts** - Not instant like Option 1

---

## 📊 Comparison Table

| Feature | Stripe Connect (Auto) | Manual Payouts | Stripe Transfers |
|---------|----------------------|----------------|------------------|
| **Setup Complexity** | High | Low | Medium |
| **Ongoing Work** | None | High | Low |
| **Payout Speed** | Instant/Daily | Weekly/Monthly | Weekly/Custom |
| **Scalability** | Excellent | Poor | Good |
| **Seller Trust** | High | Low | Medium |
| **Your Control** | Low | High | Medium |
| **Compliance** | Stripe handles | You handle | Shared |
| **Cost** | Higher fees | Lower fees | Medium fees |
| **Best For** | Growing marketplace | Small startup | Medium business |

---

## 🎯 Recommended Approach

### **For Your CircuCity Platform:**

**Start with:** **Stripe Connect (Option 1)** because:

1. **You're building a marketplace** - This is the standard
2. **Scalability** - Can grow to hundreds of sellers
3. **Trust** - Sellers trust Stripe more than manual payouts
4. **Automation** - Saves you countless hours
5. **Professional** - Looks legitimate to sellers
6. **Compliance** - Stripe handles regulations

### Implementation Roadmap:

**Phase 1: Basic Setup (Week 1-2)**
- Integrate Stripe Connect onboarding
- Add "Connect Stripe" button to seller dashboard
- Store `stripeAccountId` in database

**Phase 2: Payment Splitting (Week 3-4)**
- Modify checkout to use Connect
- Implement application fees (10% commission)
- Test with small transactions

**Phase 3: Seller Dashboard (Week 5-6)**
- Show earnings in seller dashboard
- Display payout history
- Add payout schedule info

**Phase 4: Polish (Week 7-8)**
- Handle edge cases (refunds, disputes)
- Add email notifications
- Create admin monitoring tools

---

## 💰 Commission Structure Examples

### Standard Marketplace Fees:

| Platform | Commission | Notes |
|----------|-----------|-------|
| **Etsy** | 6.5% + $0.20 | Per transaction |
| **Shopify** | 2.9% + $0.30 | Payment processing only |
| **Amazon** | 8-15% | Varies by category |
| **eBay** | 12.9% | Final value fee |
| **Uber** | 25% | Service fee |

### Suggested for CircuCity:

```
Option A: Flat Commission
├─ 10% platform fee on all sales
└─ Simple, easy to understand

Option B: Tiered Commission
├─ 15% for sales < $1,000/month
├─ 10% for sales $1,000-$5,000/month
└─ 5% for sales > $5,000/month

Option C: Subscription + Lower Fee
├─ $29/month subscription
└─ 5% commission per sale
```

---

## 🚨 Important Legal/Compliance Notes

### 1. **Money Transmitter License**
- If you hold funds, you may need licenses
- Stripe Connect avoids this (they're licensed)

### 2. **Tax Reporting**
- Must issue 1099-K forms to sellers (US)
- Stripe Connect handles this automatically

### 3. **Terms of Service**
- Clearly state commission rates
- Define payout schedules
- Explain refund policies

### 4. **Escrow Regulations**
- Holding seller funds = escrow
- Requires special licensing in many jurisdictions
- Stripe Connect avoids this issue

---

## 📝 Summary

### Current State:
- ❌ **No seller payout system**
- ❌ **All money goes to platform**
- ❌ **Manual tracking required**

### Recommended Solution:
- ✅ **Implement Stripe Connect**
- ✅ **Automatic payment splitting**
- ✅ **10% platform commission**
- ✅ **Sellers paid automatically**

### Next Steps:
1. Research Stripe Connect documentation
2. Design seller onboarding flow
3. Update database schema
4. Implement Connect integration
5. Test with test sellers
6. Launch to production

**Would you like me to help you implement Stripe Connect for your marketplace?**
