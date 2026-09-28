'use server';

import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import prisma from '@/lib/prisma';
import { getProductImages } from '@/lib/utils';
import { calculateShieldFee } from '@/lib/pricing';

// Nothing validated a product before a card was charged. Both checkout paths resolved
// the product and then tested only that it existed, so an item could be bought while
// DRAFT, SOLD or OUT_OF_STOCK, and any quantity could be bought regardless of stock --
// inventory is only decremented in the Stripe webhook, which runs after payment, so it
// went negative. This mirrors the rule the cart UI already applies in
// /api/cart/stock: sellable means status ACTIVE and enough inventory.
const MAX_QUANTITY_PER_PRODUCT = 100;

type PurchasableProduct = { id: string; name: string; status: string; inventory: number };

function assertPurchasable<T extends PurchasableProduct>(
    product: T | null | undefined,
    quantity: number,
    productId: string
): T {
    if (!product) {
        throw new Error(`Product ${productId} not found`);
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_PRODUCT) {
        throw new Error(
            `Invalid quantity for "${product.name}". Choose between 1 and ${MAX_QUANTITY_PER_PRODUCT}.`
        );
    }

    if (product.status !== 'ACTIVE') {
        throw new Error(`"${product.name}" is no longer available.`);
    }

    const available = product.inventory ?? 0;
    if (available < quantity) {
        throw new Error(
            available > 0
                ? `Only ${available} left of "${product.name}". Please reduce the quantity.`
                : `"${product.name}" is out of stock.`
        );
    }

    return product;
}

/**
 * Collapse a cart to one entry per product. Without this a per-line check is
 * bypassable: ten lines of quantity 1 each pass individually while totalling ten.
 */
function aggregateCartItems(
    items: { productId: string; quantity: number }[]
): { productId: string; quantity: number }[] {
    const totals = new Map<string, number>();
    for (const item of items) {
        const q = Number(item?.quantity);
        if (!Number.isFinite(q)) {
            throw new Error('Invalid quantity in cart.');
        }
        totals.set(item.productId, (totals.get(item.productId) ?? 0) + q);
    }
    return Array.from(totals, ([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Ensure user exists in database before checkout
 * This prevents the "blank order" bug for regular buyers
 */
async function ensureUserExists(userId: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (existingUser) {
        return existingUser;
    }

    // User doesn't exist - create from Clerk data
    console.log('User not in database, creating from Clerk data...');
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error('Could not fetch user from Clerk');
    }

    const user = await prisma.user.create({
        data: {
            id: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            image: clerkUser.imageUrl || null,
            role: 'BUYER', // Default role
        },
    });

    console.log('✅ User created in database:', user.id);

    // Create Stripe Customer for the new user
    try {
        const customer = await stripe.customers.create({
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            metadata: { clerkUserId: userId },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id },
        });
        console.log('✅ Stripe Customer created:', customer.id);
    } catch (stripeError) {
        console.error('❌ Failed to create Stripe Customer:', stripeError);
    }

    return user;
}

import { calculateShippingCost } from '@/lib/shipping-pricing';

// ... (existing imports)

// ... (existing ensureUserExists function)

export async function createCheckoutSession(productId: string) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // CRITICAL: Ensure user exists in database before checkout
    await ensureUserExists(userId);

    // Resolve the base URL for Stripe redirect URLs.
    // NEXT_PUBLIC_URL must be set in production (e.g. https://circucity.com)
    let origin = process.env.NEXT_PUBLIC_URL;
    if (!origin && process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`;
    }
    if (!origin) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'NEXT_PUBLIC_URL environment variable is not set. ' +
                'Stripe redirects cannot use localhost in production. ' +
                'Set NEXT_PUBLIC_URL=https://yourdomain.com in your server environment.'
            );
        }
        origin = 'http://localhost:3000';
    }

    const foundProduct = await prisma.product.findUnique({
        where: { id: productId },
    });

    const product = assertPurchasable(foundProduct, 1, productId);

    // Calculate shipping
    const weight = product.weight || 0;
    const shippingCost = calculateShippingCost(weight);
    const shippingAmountInCents = Math.round(shippingCost.totalShippingPrice * 100);

    // Calculate Shield Fee
    const productPrice = Number(product.price);
    const shieldFee = calculateShieldFee(productPrice);

    const productImages = getProductImages(product.images).map(img =>
        img.startsWith('/') ? `${origin}${img}` : img
    );

    // Get Stripe Customer for tax calculation
    let stripeCustomerId: string | undefined;
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        stripeCustomerId = dbUser?.stripeCustomerId || undefined;
    } catch (e) {
        console.warn('Could not fetch Stripe Customer ID:', e);
    }

    const sessionData: any = {
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'sek',
                    product_data: {
                        name: product.name,
                        images: productImages,
                        metadata: {
                            productId: product.id,
                            shopId: product.shopId,
                        }
                    },
                    unit_amount: Math.round(Number(product.price) * 100),
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: 'sek',
                    product_data: {
                        name: 'Shield Fee',
                        description: 'Buyer protection, platform security, and sustainability tracking.'
                    },
                    unit_amount: Math.round(shieldFee * 100),
                    tax_behavior: 'exclusive',
                },
                quantity: 1,
            }
        ],
        mode: 'payment',
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: shippingAmountInCents,
                        currency: 'sek',
                    },
                    display_name: 'PostNord Shipping + Handling',
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: 2,
                        },
                        maximum: {
                            unit: 'business_day',
                            value: 5,
                        },
                    },
                },
            },
        ],
        shipping_address_collection: {
            allowed_countries: ['SE', 'DK', 'NO', 'FI', 'DE'],
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cancel`,
        metadata: {
            userId,
            orderType: 'single_product',
            productId: product.id,
        },
    };

    // Attach Stripe Customer and enable automatic tax
    if (stripeCustomerId) {
        sessionData.customer = stripeCustomerId;
        sessionData.customer_update = { address: 'auto', name: 'auto' };
    }
    sessionData.automatic_tax = { enabled: true };

    const session = await stripe.checkout.sessions.create(sessionData);

    if (session.url) {
        redirect(session.url);
    }
}

export async function createCartCheckoutSession(items: { productId: string; quantity: number }[], carrier: string = 'postnord') {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    // CRITICAL: Ensure user exists in database before checkout
    await ensureUserExists(userId);

    // Resolve the base URL for Stripe redirect URLs.
    // NEXT_PUBLIC_URL must be set in production (e.g. https://circucity.com)
    let origin = process.env.NEXT_PUBLIC_URL;
    if (!origin && process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`;
    }
    if (!origin) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'NEXT_PUBLIC_URL environment variable is not set. ' +
                'Stripe redirects cannot use localhost in production. ' +
                'Set NEXT_PUBLIC_URL=https://yourdomain.com in your server environment.'
            );
        }
        origin = 'http://localhost:3000';
    }

    // Fetch all products from DB to verify prices
    const cartItems = aggregateCartItems(items);
    const productIds = cartItems.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

    // Create a map for easy lookup
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Validate every line before any Stripe object is created, so a rejected cart
    // never reaches a payment page.
    for (const item of cartItems) {
        assertPurchasable(productMap.get(item.productId) as PurchasableProduct | undefined, item.quantity, item.productId);
    }

    let totalWeight = 0;

    const line_items: any[] = cartItems.map(item => {
        const product: any = productMap.get(item.productId);

        // Calculate weight contribution
        totalWeight += ((product as any).weight || 0) * item.quantity;

        const productImages = getProductImages(product.images).map((img: string) =>
            img.startsWith('/') ? `${origin}${img}` : img
        );

        return {
            price_data: {
                currency: 'sek', // Changed to SEK
                product_data: {
                    name: product.name,
                    images: productImages,
                    metadata: {
                        productId: product.id,
                        shopId: product.shopId
                    }
                },
                unit_amount: Math.round(Number(product.price) * 100),
            },
            quantity: item.quantity,
        };
    });

    // Calculate total shipping
    const shippingCost = calculateShippingCost(totalWeight, carrier as "postnord" | "shipmondo");
    const shippingAmountInCents = Math.round(shippingCost.totalShippingPrice * 100);
    const shippingName = carrier === "shipmondo" ? "Shipmondo Shipping + Handling" : "PostNord Shipping + Handling";

    // Calculate overall Shield Fee based on subtotal
    const subtotal = cartItems.reduce((acc, item) => {
        const product: any = productMap.get(item.productId);
        return acc + (Number(product?.price || 0) * item.quantity);
    }, 0);
    const shieldFee = calculateShieldFee(subtotal);

    // Append Shield Fee line item
    line_items.push({
        price_data: {
            currency: 'sek',
            product_data: {
                name: 'Shield Fee',
                description: 'Buyer protection, platform security, and sustainability tracking.'
            },
            unit_amount: Math.round(shieldFee * 100),
        },
        quantity: 1,
    });

    // Get Stripe Customer for tax calculation
    let stripeCustomerId: string | undefined;
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        stripeCustomerId = dbUser?.stripeCustomerId || undefined;
    } catch (e) {
        console.warn('Could not fetch Stripe Customer ID:', e);
    }

    // Add tax_behavior to all line items
    for (const item of line_items) {
        if (item.price_data) {
            item.price_data.tax_behavior = 'exclusive';
        }
    }

    const sessionData: any = {
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: shippingAmountInCents,
                        currency: 'sek',
                    },
                    display_name: shippingName,
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: 2,
                        },
                        maximum: {
                            unit: 'business_day',
                            value: 5,
                        },
                    },
                },
            },
        ],
        shipping_address_collection: {
            allowed_countries: ['SE', 'DK', 'NO', 'FI', 'DE'],
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        metadata: {
            userId,
            orderType: 'cart',
        },
    };

    // Attach Stripe Customer and enable automatic tax
    if (stripeCustomerId) {
        sessionData.customer = stripeCustomerId;
        sessionData.customer_update = { address: 'auto', name: 'auto' };
    }
    sessionData.automatic_tax = { enabled: true };

    const session = await stripe.checkout.sessions.create(sessionData);

    if (session.url) {
        redirect(session.url);
    }
}

export async function createSwapShippingSession(orderId: string) {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
    await ensureUserExists(userId);

    let origin = process.env.NEXT_PUBLIC_URL;
    if (!origin && process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`;
    }
    if (!origin) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'NEXT_PUBLIC_URL environment variable is not set. '
            );
        }
        origin = 'http://localhost:3000';
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId, userId },
        include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('Order not found');

    const totalWeight = order.items.reduce(
        (acc, item) => acc + (Number(item.product.weight) || 0) * item.quantity,
        0
    );
    const shippingCost = calculateShippingCost(
        totalWeight,
        'postnord'
    );
    const shippingAmountInCents = Math.round(
        shippingCost.totalShippingPrice * 100
    );

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'sek',
                    product_data: {
                        name: 'Swap Shipping',
                        description:
                            'Shipping cost for your swap order #' +
                            orderId.slice(-6).toUpperCase(),
                    },
                    unit_amount: shippingAmountInCents,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: ['SE', 'DK', 'NO', 'FI', 'DE'],
        },
        success_url: `${origin}/dashboard/orders/${orderId}?shipping_paid=true`,
        cancel_url: `${origin}/dashboard/orders/${orderId}`,
        metadata: {
            userId,
            orderType: 'swap_shipping',
            orderId: order.id,
        },
    });

    if (session.url) redirect(session.url);
}
