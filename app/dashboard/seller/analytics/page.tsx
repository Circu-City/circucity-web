import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Eye, TrendingUp, ShoppingBag, MousePointerClick } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { id: true, name: true }
    });

    if (!shop) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Shop Not Found</h2>
                <p className="text-gray-500">Please create a shop to view analytics.</p>
            </div>
        );
    }

    // --- Data Fetching ---

    // 1. Total Views
    const totalViews = await prisma.productView.count({
        where: { shopId: shop.id }
    });

    // Total product count for this shop
    const totalProductCount = await prisma.product.count({
        where: { shopId: shop.id }
    });

    // 2. Total Orders (for conversion rate)
    // We need to count orders that contain items from this shop
    // Since Order doesn't have shopId directly, we look at OrderItems -> Product -> Shop
    // But OrderItem -> Product is relation.
    // Actually, simplest is to query OrderItems where product.shopId = shop.id
    const totalShopOrders = await prisma.orderItem.count({
        where: {
            product: {
                shopId: shop.id
            }
        }
    });

    // Conversion Rate
    const conversionRate = totalViews > 0
        ? ((totalShopOrders / totalViews) * 100).toFixed(1)
        : '0.0';

    // 3. Views Last 30 Days (for chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Group by day (fetch raw and group in JS slightly heavier but flexible)
    const recentViews = await prisma.productView.findMany({
        where: {
            shopId: shop.id,
            viewedAt: {
                gte: thirtyDaysAgo
            }
        },
        select: { viewedAt: true }
    });

    const viewsByDay = new Map<string, number>();
    // Initialize last 7 days for chart
    const chartData: { date: string; day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        viewsByDay.set(key, 0);
        chartData.push({ date: key, day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: 0 });
    }

    recentViews.forEach(v => {
        const key = v.viewedAt.toISOString().split('T')[0];
        if (viewsByDay.has(key)) {
            viewsByDay.set(key, (viewsByDay.get(key) || 0) + 1);
        }
    });

    // Update chart data
    chartData.forEach(d => {
        d.count = viewsByDay.get(d.date) || 0;
    });

    // 4. Top Viewed Products
    // Using Prisma groupBy (if supported) or findMany and aggregation
    // findMany is safer for now if standard DB
    // Optimization: aggregations
    // But for MVP, fetch all relevant views or limit?
    // Let's use groupBy if valid, otherwise raw
    // prisma.productView.groupBy({ by: ['productId'], _count: true, orderBy: ... })

    const topViewedGroup = await prisma.productView.groupBy({
        by: ['productId'],
        _count: {
            productId: true
        },
        where: { shopId: shop.id },
        orderBy: {
            _count: {
                productId: 'desc'
            }
        },
        take: 5
    });

    // Get product details
    const topProductIds = topViewedGroup.map(g => g.productId);
    const topProducts = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true, status: true, images: true }
    });

    // Merge counts
    const topProductsWithCounts = topProducts.map(p => {
        const count = topViewedGroup.find(g => g.productId === p.id)?._count.productId || 0;
        return { ...p, views: count };
    }).sort((a, b) => b.views - a.views);


    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#2D5F3F]">Analytics Overview</h1>
                    <p className="text-gray-500">Performance metrics for {shop.name}</p>
                </div>
                <div className="flex gap-2">
                    <select className="text-sm text-gray-600 border rounded-full px-3 py-1 bg-white">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Views */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">All Time</span>
                    </div>
                    <p className="text-2xl font-bold text-[#2D5F3F]">{totalViews}</p>
                    <p className="text-sm text-gray-500">Total Product Views</p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {conversionRate}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-[#2D5F3F]">{conversionRate}%</p>
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                </div>

                {/* Avg Views/Product (Calculated roughly) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <MousePointerClick className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2D5F3F]">
                        {totalProductCount > 0 ? Math.round(totalViews / totalProductCount) : 0}
                    </p>
                    <p className="text-sm text-gray-500">Avg. Views per Product</p>
                </div>

                {/* Total Orders (Context) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <ShoppingBag className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2D5F3F]">{totalShopOrders}</p>
                    <p className="text-sm text-gray-500">Total Orders items</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Views Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-[#2D5F3F] mb-6">Traffic Overview</h3>
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {chartData.map((d, i) => {
                            const max = Math.max(...chartData.map(c => c.count), 1);
                            const height = max > 0 ? (d.count / max) * 100 : 0;
                            // Ensure mostly visible minimal height
                            const displayHeight = d.count > 0 ? Math.max(height, 5) : 2;

                            return (
                                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                                    <div className="relative w-full flex flex-col justify-end h-full">
                                        <div
                                            className={`w-full rounded-t-md transition-all duration-500 ${d.count > 0 ? 'bg-[#2D5F3F] opacity-90 hover:opacity-100' : 'bg-gray-100'}`}
                                            style={{ height: `${displayHeight}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2D5F3F] text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity">
                                                {d.count} views
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">{d.day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-[#2D5F3F] mb-6">Most Viewed</h3>
                    <div className="space-y-4">
                        {topProductsWithCounts.length > 0 ? (
                            topProductsWithCounts.map((product, i) => (
                                <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2D5F3F] truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{Number(product.price).toFixed(2)} Kr</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-[#2D5F3F]">{product.views}</span>
                                        <p className="text-[10px] text-gray-400">views</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No viewing data yet</p>
                            </div>
                        )}

                        {topProductsWithCounts.length > 0 && (
                            <div className="pt-4 mt-4 border-t">
                                <Link
                                    href="/dashboard/seller/products"
                                    className="text-sm text-[#2D5F3F] font-medium hover:underline flex items-center justify-center"
                                >
                                    Manage Products
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
