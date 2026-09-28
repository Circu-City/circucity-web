import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { sendNotification } from '@/lib/notifications';
import { sendThankYouEmail, sendNewSaleAlertEmail, sendRefundReceiptEmail, sendEcoMilestoneEmail } from '@/lib/email';
import { calculateShieldFee } from '@/lib/pricing';
import { consumeReservations, releaseReservations } from '@/lib/inventory';

export async function POST(req: Request) {
    console.log('=== STRIPE WEBHOOK RECEIVED ===');

    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    // DEBUG LOGGING
    console.log("Webhook received. Signature:", signature ? "Present" : "Missing");
    console.log("Using Secret:", process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 10) + "...");
    console.log("Body length:", body.length);

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("✅ Webhook signature verified successfully");
        console.log("Event type:", event.type);
    } catch (error: any) {
        console.error("❌ Webhook signature verification failed:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    console.log(`Processing event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Real inventory is decremented further down, so the hold has to stop counting
        // or the item is subtracted twice. Done first: if fulfilment throws below, the
        // hold must not survive. Should this never run, the hold lapses on its own.
        const reservationId = session.metadata?.reservationId;
        if (reservationId) {
            try {
                const consumed = await consumeReservations(reservationId);
                console.log(`Consumed ${consumed} inventory reservation(s) for ${reservationId}`);
            } catch (e: any) {
                console.error('Failed to consume reservations:', e?.message);
            }
        }

        console.log('=== CHECKOUT SESSION COMPLETED ===');
        console.log('Session ID:', session.id);
        console.log('Payment Status:', session.payment_status);
        console.log('Amount Total:', session.amount_total);

        try {
            // Retrieve the session to get line items and expanded details
            console.log('Retrieving session with line items...');
            const retrievedSession = await stripe.checkout.sessions.retrieve(
                session.id,
                {
                    expand: ['line_items.data.price.product'],
                }
            );

            const userId = retrievedSession.metadata?.userId;
            const orderType = retrievedSession.metadata?.orderType;
            const lineItems = retrievedSession.line_items?.data;

            console.log(`User ID from metadata: ${userId}`);
            console.log(`Order type: ${orderType}`);
            console.log(`Found ${lineItems?.length || 0} line items`);

            // Store Stripe Customer ID on user if present
            if (retrievedSession.customer && userId) {
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { stripeCustomerId: retrievedSession.customer as string },
                    });
                } catch (e) {
                    console.warn('Could not update stripeCustomerId:', e);
                }
            }

            // Handle swap shipping payment — update existing order
            if (orderType === 'swap_shipping') {
                const swapOrderId = retrievedSession.metadata?.orderId;
                console.log(`=== SWAP SHIPPING PAYMENT ===`);
                console.log(`Updating order ${swapOrderId} with shipping info`);

                if (!swapOrderId) {
                    console.error('❌ Missing orderId in swap_shipping metadata');
                    return new NextResponse('Error: Missing orderId', { status: 400 });
                }

                const customerDetails = retrievedSession.customer_details;
                const shippingDetails = (retrievedSession as any).shipping_details || (retrievedSession as any).shipping;
                const shippingAddress = shippingDetails?.address || customerDetails?.address;
                const shippingName = shippingDetails?.name || customerDetails?.name;

                await prisma.order.update({
                    where: { id: swapOrderId },
                    data: {
                        total: Number(retrievedSession.amount_total) / 100,
                        shippingName: shippingName,
                        shippingAddressLine1: shippingAddress?.line1,
                        shippingAddressLine2: shippingAddress?.line2,
                        shippingCity: shippingAddress?.city,
                        shippingState: shippingAddress?.state,
                        shippingPostalCode: shippingAddress?.postal_code,
                        shippingCountry: shippingAddress?.country,
                    },
                });

                console.log(`✅ Swap order ${swapOrderId} updated with shipping info`);

                return NextResponse.json({ received: true });
            }

            if (!userId) {
                console.error("❌ Missing userId in session metadata");
                console.log("Available metadata:", retrievedSession.metadata);
                return new NextResponse('Webhook Error: Missing userId in metadata', { status: 400 });
            }

            if (!lineItems || lineItems.length === 0) {
                console.error("❌ No line items found in session");
                return new NextResponse('Webhook Error: No line items found', { status: 400 });
            }

            // Verify user exists in database
            console.log('Verifying user exists in database...');
            const userExists = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!userExists) {
                console.error(`❌ User ${userId} not found in database`);
                return new NextResponse('Webhook Error: User not found', { status: 400 });
            }
            console.log('✅ User verified');

            // Extract shipping details from Stripe Session
            // Stripe stores customer info in customer_details
            console.log('\n=== SHIPPING INFORMATION DEBUG ===');

            const customerDetails = retrievedSession.customer_details;
            const shippingDetails = (retrievedSession as any).shipping_details || (retrievedSession as any).shipping;

            console.log('Customer details:', {
                name: customerDetails?.name,
                email: customerDetails?.email,
                address: customerDetails?.address
            });
            console.log('Shipping details (if separate):', shippingDetails);

            // Use customer_details.address (this is where Stripe puts the shipping address)
            const shippingAddress = shippingDetails?.address || customerDetails?.address;
            const shippingName = shippingDetails?.name || customerDetails?.name;

            console.log('Final extracted shipping info:', {
                name: shippingName,
                addressLine1: shippingAddress?.line1,
                addressLine2: shippingAddress?.line2,
                city: shippingAddress?.city,
                state: shippingAddress?.state,
                postalCode: shippingAddress?.postal_code,
                country: shippingAddress?.country
            });

            // Validate and prepare order items
            console.log('Validating line items...');
            const orderItemsData: { productId: string; quantity: number; price: number; co2Saved: number }[] = [];

            for (let i = 0; i < lineItems.length; i++) {
                const item = lineItems[i] as any;
                console.log(`\nProcessing line item ${i + 1}:`, {
                    id: item.id,
                    description: item.description,
                    quantity: item.quantity,
                    amount: item.amount_total
                });

                if (!item.price) {
                    console.error(`❌ Line item ${i + 1} missing price data`);
                    throw new Error(`Line item ${i + 1} missing price data`);
                }

                const product = item.price.product as Stripe.Product;
                console.log('Product metadata:', product.metadata);

                if (item.description === 'Shield Fee') {
                    console.log('Detected Shield Fee line item, skipping product lookup.');
                    continue;
                }

                const productId = product.metadata?.productId;

                if (!productId) {
                    console.error(`❌ Missing productId in metadata for item ${item.id}`);
                    console.log('Available metadata:', product.metadata);
                    throw new Error(`Missing productId for item: ${item.description || 'Unknown'}`);
                }

                // Verify product exists in database
                const dbProduct = await prisma.product.findUnique({
                    where: { id: productId },
                    select: { id: true, co2Saved: true, inventory: true }
                });

                if (!dbProduct) {
                    console.error(`❌ Product ${productId} not found in database`);
                    throw new Error(`Product ${productId} not found in database`);
                }

                console.log(`✅ Product ${productId} verified in database`);

                orderItemsData.push({
                    productId: productId,
                    quantity: item.quantity || 1,
                    price: Number(item.price.unit_amount) / 100,
                    co2Saved: dbProduct.co2Saved || 0
                });
            }

            const totalCo2Saved = orderItemsData.reduce((sum, item) => sum + ((item.co2Saved || 0) * item.quantity), 0);

            // Calculate Shield Fee metrics from subtotal
            const subtotal = orderItemsData.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const feeGross = calculateShieldFee(subtotal);
            const feeVat = feeGross * 0.20; // 25% VAT -> 20% of gross
            const feeNet = feeGross - feeVat;

            console.log('\n=== CREATING ORDER ===');
            console.log('Order data:', {
                userId,
                total: Number(retrievedSession.amount_total) / 100,
                itemCount: orderItemsData.length
            });

            // Get payment intent to store charge ID
            const paymentIntentId = retrievedSession.payment_intent as string;
            let chargeId: string | null = null;

            if (paymentIntentId) {
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                    chargeId = paymentIntent.latest_charge as string;
                    console.log('Charge ID:', chargeId);
                } catch (error) {
                    console.warn('Could not retrieve charge ID:', error);
                }
            }

            // Fee Configuration
            const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
            const PLATFORM_FIXED_FEE = 5.00; // 5 SEK

            const orderTotal = Number(retrievedSession.amount_total) / 100;
            const processingFee = (orderTotal * PLATFORM_FEE_PERCENTAGE) + PLATFORM_FIXED_FEE;

            // Create the order
            const order = await prisma.order.create({
                data: {
                    userId: userId,
                    total: orderTotal,
                    processingFee: processingFee, // Record the Stripe fee
                    feeGross: feeGross,
                    feeVat: feeVat,
                    feeNet: feeNet,
                    status: 'PAID',
                    stripeChargeId: chargeId, // Store for refund tracking
                    // Shipping Info
                    shippingName: shippingName,
                    shippingAddressLine1: shippingAddress?.line1,
                    shippingAddressLine2: shippingAddress?.line2,
                    shippingCity: shippingAddress?.city,
                    shippingState: shippingAddress?.state,
                    shippingPostalCode: shippingAddress?.postal_code,
                    shippingCountry: shippingAddress?.country,

                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true
                }
            });

            console.log(`✅ Order ${order.id} created successfully with ${order.items.length} items`);

            // --- ECO POINTS & MILESTONES ---
            console.log('\n=== AWARDING ECO POINTS ===');
            const earnedPoints = Math.floor(orderTotal / 10); // 1 point per 10 kr spent
            if (earnedPoints > 0) {
                try {
                    const updatedUser = await prisma.user.update({
                        where: { id: userId },
                        data: { ecoPoints: { increment: earnedPoints } }
                    });

                    console.log(`Earned ${earnedPoints} points. Total is now ${updatedUser.ecoPoints}`);

                    // ─── Referral Bonus: Award referrer on first purchase ───
                    if (updatedUser.referredBy) {
                      try {
                        const referrer = await prisma.user.findUnique({ where: { id: updatedUser.referredBy }, select: { id: true, ecoPoints: true } });
                        if (referrer) {
                          const orderCount = await prisma.order.count({ where: { userId } });
                          if (orderCount <= 1) {
                            await prisma.user.update({
                              where: { id: referrer.id },
                              data: { ecoPoints: { increment: 500 } },
                            });
                            console.log(`Referral bonus: +500 tokens awarded to referrer ${referrer.id}`);
                          }
                        }
                      } catch (e) { console.error('Referral bonus error:', e); }
                    }

                    const previousPoints = updatedUser.ecoPoints - earnedPoints;
                    const milestones = [100, 500, 1000, 5000, 10000];
                    const crossedMilestone = milestones.find(m => previousPoints < m && updatedUser.ecoPoints >= m);

                    if (crossedMilestone && updatedUser.email) {
                        try {
                            await sendEcoMilestoneEmail({
                                to: updatedUser.email,
                                name: updatedUser.name,
                                ecoPoints: crossedMilestone
                            });
                            console.log(`Sent Milestone email for ${crossedMilestone} points to ${updatedUser.email}`);
                        } catch (e) {
                            console.error('Failed to send milestone email:', e);
                        }
                    }
                } catch (pointError) {
                    console.error('Failed to award eco points:', pointError);
                }
            }

            if (totalCo2Saved > 0) {
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { totalCo2Saved: { increment: totalCo2Saved } }
                    });
                    console.log(`Added ${totalCo2Saved}kg CO2 saved for user ${userId}`);
                } catch (co2Error) {
                    console.error('Failed to update CO2 saved:', co2Error);
                }
            }

            // Update Inventory
            console.log('\n=== UPDATING INVENTORY ===');
            for (const item of lineItems) {
                if (!item.price) continue;

                const product = item.price.product as Stripe.Product;
                const productId = product.metadata?.productId;
                const quantity = item.quantity || 1;

                if (productId) {
                    console.log(`Updating inventory for product ${productId}, decrementing by ${quantity}`);

                    await prisma.product.update({
                        where: { id: productId },
                        data: {
                            inventory: {
                                decrement: quantity
                            },
                        },
                    });

                    // Check if we need to update status
                    const updatedProduct = await prisma.product.findUnique({
                        where: { id: productId },
                        select: { id: true, inventory: true, status: true }
                    });

                    console.log(`Product ${productId} inventory after update:`, updatedProduct?.inventory);

                    if (updatedProduct && updatedProduct.inventory <= 0) {
                        console.log(`Setting product ${productId} status to OUT_OF_STOCK`);
                        await prisma.product.update({
                            where: { id: productId },
                            data: { status: 'OUT_OF_STOCK' }
                        });
                    }
                }
            }

            console.log('✅ Inventory updated successfully');

            // --- NOTIFICATIONS START ---
            try {
                // 1. Notify Buyer
                await sendNotification(
                    userId,
                    'Order Confirmed',
                    `Your order #${order.id.slice(-6)} has been placed successfully.`,
                    'SUCCESS',
                    `/dashboard/orders/${order.id}`
                );

                // 2. Notify Sellers
                // Group items by shopId
                const shopItems = new Map<string, string[]>();

                for (const item of lineItems) {
                    const product = item.price?.product as Stripe.Product;
                    const shopId = product?.metadata?.shopId;

                    if (shopId && product.name) {
                        const current = shopItems.get(shopId) || [];
                        current.push(product.name);
                        shopItems.set(shopId, current);
                    }
                }

                // Send notifications to each shop owner
                for (const [shopId, products] of shopItems) {
                    const shop = await prisma.shop.findUnique({
                        where: { id: shopId },
                        select: { ownerId: true, name: true, owner: { select: { email: true } } }
                    });

                    if (shop && shop.ownerId) {
                        await sendNotification(
                            shop.ownerId,
                            'New Order Received',
                            `You have a received a new order for: ${products.join(', ')}`,
                            'ORDER',
                            `/dashboard/seller/orders`
                        );
                        console.log(`Sent notification to seller ${shop.name} (${shop.ownerId})`);
                        if (shop.owner?.email) {
                            try {
                                await sendNewSaleAlertEmail({
                                    to: shop.owner.email,
                                    shopName: shop.name || 'Seller',
                                    orderShortId: order.id.slice(-6),
                                    products: products
                                });
                                console.log(`✅ Sent New Sale Alert email to ${shop.owner.email}`);
                            } catch (e) {
                                console.error('Failed to send sale alert email:', e);
                            }
                        }
                    }
                }
                console.log('✅ Notifications sent');

            } catch (notifError) {
                console.error('Error sending notifications:', notifError);
                // Don't fail the webhook if notifications fail
            }
            // --- NOTIFICATIONS END ---

            // --- THANK YOU EMAIL (order confirmation) ---
            console.log('\n=== ATTEMPTING TO SEND THANK YOU EMAIL ===');
            const buyerEmail = userExists.email ?? customerDetails?.email;
            console.log('Buyer email lookup:', {
                userEmail: userExists.email,
                customerEmail: customerDetails?.email,
                finalEmail: buyerEmail
            });

            if (buyerEmail) {
                try {
                    console.log('Preparing thank you email for:', buyerEmail);
                    const thankYouItems = lineItems.map((item: any) => {
                        const product = item.price?.product as Stripe.Product;
                        return {
                            name: product?.name ?? 'Product',
                            quantity: item.quantity ?? 1,
                            price: Number(item.price?.unit_amount ?? 0) / 100,
                        };
                    });
                    const shippingLines = [
                        shippingName,
                        shippingAddress?.line1,
                        shippingAddress?.line2,
                        [shippingAddress?.city, shippingAddress?.state, shippingAddress?.postal_code].filter(Boolean).join(', '),
                        shippingAddress?.country,
                    ].filter(Boolean);
                    console.log('Email details:', {
                        to: buyerEmail,
                        orderId: order.id,
                        itemsCount: thankYouItems.length,
                        total: Number(order.total)
                    });
                    await sendThankYouEmail({
                        to: buyerEmail,
                        name: userExists.name ?? shippingName ?? undefined,
                        orderId: order.id,
                        orderShortId: order.id.slice(-6),
                        items: thankYouItems,
                        total: Number(order.total),
                        shippingAddress: shippingLines.join('\n') || 'See order details in your account.',
                    });
                    console.log('✅ Thank you email sent successfully to', buyerEmail);
                } catch (emailError: any) {
                    console.error('❌ Thank you email failed:', emailError?.message ?? emailError);
                    console.error('Full error:', JSON.stringify(emailError, null, 2));
                }
            } else {
                console.error('❌ Cannot send thank you email: No buyer email found');
                console.error('User email:', userExists.email);
                console.error('Customer details email:', customerDetails?.email);
            }
            // --- END THANK YOU EMAIL ---

            console.log('=== WEBHOOK PROCESSING COMPLETE ===\n');

            return new NextResponse(JSON.stringify({
                received: true,
                orderId: order.id
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error: any) {
            console.error('❌ ERROR CREATING ORDER:');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            // Return 500 so Stripe will retry
            return new NextResponse(
                JSON.stringify({
                    error: 'Database write failed',
                    details: error.message
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // An abandoned checkout returns its stock as soon as Stripe says the session is
    // dead, rather than sitting held until the TTL lapses.
    if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        const reservationId = session.metadata?.reservationId;
        if (reservationId) {
            try {
                const released = await releaseReservations(reservationId);
                console.log(`Released ${released} inventory reservation(s) for expired session ${session.id}`);
            } catch (e: any) {
                console.error('Failed to release reservations:', e?.message);
            }
        }
        return NextResponse.json({ received: true });
    }

    // Handle refunds
    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;

        console.log('=== CHARGE REFUNDED ===');
        console.log('Charge ID:', charge.id);
        console.log('Amount refunded:', charge.amount_refunded / 100);
        console.log('Fully refunded:', charge.refunded);

        try {
            // Find the order by charge ID
            const order = await prisma.order.findFirst({
                where: { stripeChargeId: charge.id },
                include: { items: true, user: true }
            });

            if (!order) {
                console.error('❌ Order not found for charge:', charge.id);
                return new NextResponse('Order not found', { status: 404 });
            }

            console.log('Found order:', order.id);

            // Check if already processed to prevent duplicate processing
            if (order.status === 'REFUNDED' || order.status === 'CANCELLED') {
                console.log('ℹ️  Order already refunded/cancelled, skipping');
                return new NextResponse(JSON.stringify({ received: true, message: 'Already processed' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const refundAmount = Number(charge.amount_refunded) / 100;
            const orderTotal = Number(order.total);
            const isFullRefund = charge.refunded || refundAmount >= orderTotal;

            console.log('Refund details:', {
                refundAmount,
                orderTotal,
                isFullRefund
            });

            // Update order status
            const newStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: newStatus,
                    refundId: charge.refunds?.data[0]?.id || null,
                    refundAmount: refundAmount,
                    cancelledAt: new Date(),
                    cancellationReason: 'Refunded via Stripe'
                }
            });

            console.log(`✅ Order ${order.id} status updated to ${newStatus}`);

            if (order.user?.email) {
                try {
                    await sendRefundReceiptEmail({
                        to: order.user.email,
                        name: order.user.name,
                        orderShortId: order.id.slice(-6),
                        amount: refundAmount
                    });
                    console.log(`✅ Sent Refund Receipt email to ${order.user.email}`);
                } catch (e) {
                    console.error('Failed to send refund email:', e);
                }
            }

            // Restore inventory for full refunds
            if (isFullRefund) {
                console.log('\n=== RESTORING INVENTORY ===');

                for (const item of order.items) {
                    console.log(`Restoring inventory for product ${item.productId}, incrementing by ${item.quantity}`);

                    try {
                        await prisma.product.update({
                            where: { id: item.productId },
                            data: {
                                inventory: {
                                    increment: item.quantity
                                }
                            }
                        });

                        // Check if we need to update product status
                        const updatedProduct = await prisma.product.findUnique({
                            where: { id: item.productId },
                            select: { id: true, inventory: true, status: true }
                        });

                        console.log(`Product ${item.productId} inventory after restoration:`, updatedProduct?.inventory);

                        // If product was out of stock and now has inventory, mark as active
                        if (updatedProduct && updatedProduct.status === 'OUT_OF_STOCK' && updatedProduct.inventory > 0) {
                            console.log(`Setting product ${item.productId} status to ACTIVE`);
                            await prisma.product.update({
                                where: { id: item.productId },
                                data: { status: 'ACTIVE' }
                            });
                        }
                    } catch (error: any) {
                        console.error(`❌ Error restoring inventory for product ${item.productId}:`, error.message);
                        // Continue with other items even if one fails
                    }
                }

                console.log('✅ Inventory restored successfully');
            } else {
                console.log('ℹ️  Partial refund - inventory not restored automatically');
            }

            console.log('=== REFUND PROCESSING COMPLETE ===\n');

            return new NextResponse(JSON.stringify({
                received: true,
                orderId: order.id,
                status: newStatus
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error: any) {
            console.error('❌ ERROR PROCESSING REFUND:');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            return new NextResponse(
                JSON.stringify({
                    error: 'Refund processing failed',
                    details: error.message
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // For other event types
    console.log(`Event type ${event.type} received but not processed`);
    return new NextResponse(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

