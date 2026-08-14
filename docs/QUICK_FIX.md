# Quick Fix Guide for Stripe Webhook Issues

## 🚨 IMMEDIATE ACTION REQUIRED

Your webhook secret in `.env.local` is malformed. This is likely why orders aren't being saved.

### Fix the Webhook Secret

**Current (WRONG):**
```
STRIPE_WEBHOOK_SECRET=wwhsec_xxxxx
```

**Option 1: Local Testing (Recommended for Development)**

1. Run the test script:
   ```bash
   ./test-webhook.sh
   ```

2. Copy the webhook secret that appears (starts with `whsec_`)

3. Update `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Use the actual secret from step 2
   ```

4. Restart your dev server

**Option 2: Use the Existing Secret**

If the second part of your secret is valid, update `.env.local` to:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxß
```

## 🔧 Complete Setup Steps

### 1. Fix Environment Variables

Add to `.env.local`:
```bash
# Clerk Webhook (for user sync)
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # Get from Clerk Dashboard

# Stripe Webhook (already exists, just fix it)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Fix as described above
```

### 2. Set Up Clerk Webhook (Important!)

This ensures users exist in your database before orders are created.

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to "Webhooks" in the sidebar
4. Click "Add Endpoint"
5. Enter endpoint URL:
   - **Local:** Use ngrok or similar: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - **Production:** `https://yourdomain.com/api/webhooks/clerk`
6. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the "Signing Secret" and add to `.env.local` as `CLERK_WEBHOOK_SECRET`

### 3. Test Locally

#### Terminal 1: Start Dev Server
```bash
npm run dev
```

#### Terminal 2: Forward Stripe Webhooks
```bash
./test-webhook.sh
```

Or manually:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### Terminal 3: Trigger Test Event
```bash
stripe trigger checkout.session.completed
```

### 4. Verify Order Creation

After completing a test payment, check:

```bash
# Open Prisma Studio to view database
npx prisma studio
```

Look for:
- ✅ New order in `Order` table
- ✅ Order items in `OrderItem` table
- ✅ Updated inventory in `Product` table

## 🐛 Debugging

### View Detailed Logs

The webhook now includes comprehensive logging. Watch your terminal for:

```
=== STRIPE WEBHOOK RECEIVED ===
✅ Webhook signature verified successfully
=== CHECKOUT SESSION COMPLETED ===
Session ID: cs_test_xxxxx
✅ User verified
✅ Product clm123abc verified in database
=== CREATING ORDER ===
✅ Order clm456def created successfully with 1 items
✅ Inventory updated successfully
=== WEBHOOK PROCESSING COMPLETE ===
```

### Common Errors

**❌ "Webhook signature verification failed"**
- Fix: Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Restart dev server after changing

**❌ "User not found in database"**
- Fix: Set up Clerk webhook (see step 2 above)
- Or manually create user in database

**❌ "Product not found in database"**
- Fix: Ensure product exists and ID matches
- Check product metadata in Stripe

## 📊 Monitoring

### Check Webhook Deliveries

**Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your endpoint
3. View "Events" tab

**Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Navigate to "Webhooks"
3. Click on your endpoint
4. View recent deliveries

## 🚀 Production Deployment

### Vercel Environment Variables

Add these to your Vercel project:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From Stripe Dashboard
CLERK_WEBHOOK_SECRET=whsec_xxxxx   # From Clerk Dashboard
```

### Stripe Production Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/webhooks/stripe`
4. Select event: `checkout.session.completed`
5. Copy signing secret to Vercel env vars

## 📝 Quick Checklist

- [ ] Fix `STRIPE_WEBHOOK_SECRET` in `.env.local`
- [ ] Add `CLERK_WEBHOOK_SECRET` to `.env.local`
- [ ] Set up Clerk webhook endpoint
- [ ] Restart dev server
- [ ] Run `./test-webhook.sh` in separate terminal
- [ ] Test a payment with card `4242 4242 4242 4242`
- [ ] Verify order in database with `npx prisma studio`
- [ ] Check logs for success messages

## 🆘 Still Having Issues?

Check the detailed logs in your terminal. The enhanced webhook handler will show you exactly where the process fails.

Common log patterns:

**Success:**
```
✅ Webhook signature verified
✅ User verified
✅ Product verified
✅ Order created
✅ Inventory updated
```

**Failure:**
```
❌ [Error description]
```

The error message will tell you exactly what's wrong!
