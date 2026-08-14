import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the seller's shop
        const shop = await prisma.shop.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        // Get all product IDs for this shop
        const products = await prisma.product.findMany({
            where: { shopId: shop.id },
            select: { id: true, status: true, co2Saved: true }
        });

        const productIds = products.map(p => p.id);

        // Count active products
        const activeProducts = products.filter(p => p.status === 'ACTIVE').length;

        // Get all orders containing seller's products
        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: { in: productIds }
            },
            include: {
                order: {
                    select: {
                        status: true,
                        total: true,
                        createdAt: true
                    }
                },
                product: {
                    select: {
                        co2Saved: true
                    }
                }
            }
        });

        // Filter for paid orders only
        const paidOrderItems = orderItems.filter(
            item => item.order.status === 'PAID' ||
                item.order.status === 'SHIPPED' ||
                item.order.status === 'DELIVERED'
        );

        // Calculate total sales (sum of all item prices * quantities)
        const totalSales = paidOrderItems.reduce((sum, item) => {
            return sum + (Number(item.price) * item.quantity);
        }, 0);

        // Get unique order count
        const uniqueOrderIds = new Set(paidOrderItems.map(item => item.orderId));
        const totalOrders = uniqueOrderIds.size;

        // Calculate total CO₂ saved (sum of co2Saved * quantity for all sold items)
        const co2Saved = paidOrderItems.reduce((sum, item) => {
            return sum + (item.product.co2Saved * item.quantity);
        }, 0);

        // Get revenue data for the past 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrderItems = paidOrderItems.filter(
            item => new Date(item.order.createdAt) >= sevenDaysAgo
        );

        // Group by day
        const dailyRevenue = Array(7).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        recentOrderItems.forEach(item => {
            const orderDate = new Date(item.order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 0 && daysDiff < 7) {
                const index = 6 - daysDiff; // Reverse so today is last
                dailyRevenue[index] += Number(item.price) * item.quantity;
            }
        });

        // Get top selling products
        const productSales = new Map<string, { name: string; sales: number; productId: string }>();

        paidOrderItems.forEach(item => {
            const existing = productSales.get(item.productId);
            if (existing) {
                existing.sales += item.quantity;
            } else {
                productSales.set(item.productId, {
                    name: '', // Will fetch below
                    sales: item.quantity,
                    productId: item.productId
                });
            }
        });

        // Fetch product names for top sellers
        const topProductIds = Array.from(productSales.keys()).slice(0, 10);
        const topProducts = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true }
        });

        topProducts.forEach(product => {
            const sales = productSales.get(product.id);
            if (sales) {
                sales.name = product.name;
            }
        });

        const topSelling = Array.from(productSales.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map(item => ({
                name: item.name,
                sales: item.sales,
                status: item.sales > 10 ? 'Trending' : 'Low'
            }));

        // Get recent orders (last 5 unique orders)
        const recentOrderIds = Array.from(uniqueOrderIds).slice(-5);
        const recentOrders = await prisma.order.findMany({
            where: { id: { in: recentOrderIds } },
            include: {
                items: {
                    where: { productId: { in: productIds } },
                    select: {
                        quantity: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const formattedRecentOrders = recentOrders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const orderTotal = order.items.reduce((sum, item) =>
                sum + (Number(item.price) * item.quantity), 0
            );

            return {
                id: `#${order.id.slice(-4).toUpperCase()}`,
                items: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
                total: `$${orderTotal.toFixed(2)}`,
                date: new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                status: order.status,
                orderId: order.id
            };
        });

        // Get store views (from ProductView table, filter by shop)
        const storeViews = await prisma.productView.count({
            where: { shopId: shop.id }
        });

        return NextResponse.json({
            totalSales: Math.round(totalSales * 100) / 100,
            totalOrders,
            activeProducts,
            co2Saved: Math.round(co2Saved * 10) / 10,
            dailyRevenue,
            topSelling,
            recentOrders: formattedRecentOrders,
            storeViews,
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
