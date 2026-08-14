'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    DollarSign,
    ShoppingBag,
    Eye,
    Leaf,
    ArrowDownRight,
    Package,
    MoreHorizontal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SellerFeedbackPanel from "@/components/seller/FeedbackPanel";

interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    storeViews?: number;
    co2Saved?: number;
    dailyRevenue?: number[];
    topSelling?: Array<{ name: string; sales: number; status: string }>;
    recentOrders?: Array<{
        id: string;
        items: string;
        total: string;
        date: string;
        status: string;
        orderId: string;
    }>;
}

export default function SellerDashboard() {
    const { user } = useUser();
    const [stats, setStats] = useState<DashboardStats>({
        totalSales: 0,
        totalOrders: 0,
        activeProducts: 0,
        storeViews: 0,
        co2Saved: 0,
        dailyRevenue: [0, 0, 0, 0, 0, 0, 0],
        topSelling: [],
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch real stats from API
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(prev => ({
                        ...prev,
                        ...data
                    }));
                } else {
                    console.error('Failed to fetch stats:', await res.text());
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchStats();
        }
    }, [user]);

    // Use real data from API, fallback to empty arrays if not loaded yet
    const topSelling = stats.topSelling || [];
    const recentOrders = stats.recentOrders || [];
    const dailyRevenue = stats.dailyRevenue || [0, 0, 0, 0, 0, 0, 0];

    return (
        <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`${stats.totalSales.toLocaleString()} Kr`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Active Orders"
                    value={stats.totalOrders.toString()}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Store Views"
                    value={stats.storeViews?.toLocaleString() || '0'}
                    icon={Eye}
                />
                <StatCard
                    title="CO₂ Saved"
                    value={`${stats.co2Saved} kg`}
                    icon={Leaf}
                />
            </div>

            {/* Middle Section: Chart + Top Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#2D5F3F]">Revenue Overview</h3>
                            <p className="text-sm text-gray-500">Daily revenue performance for the past 7 days</p>
                        </div>
                    </div>

                    {/* Revenue Chart with Real Data */}
                    <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                        {dailyRevenue.map((revenue, i) => {
                            const maxRevenue = Math.max(...dailyRevenue, 1);
                            // Calculate height percentage, ensuring minimum visibility
                            const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                            // Minimum height of 5% for visibility, or 100% if it's the max
                            const displayHeight = revenue > 0 ? Math.max(heightPercent, 8) : 5;

                            return (
                                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end">
                                    <div
                                        className={`w-full rounded-t-sm transition-all relative group ${revenue > 0
                                            ? 'bg-[#2D5F3F]/80 hover:bg-[#2D5F3F]'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        style={{ height: `${displayHeight}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#2D5F3F] text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                            {revenue.toFixed(2)} Kr
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-[#2D5F3F] mb-1">Top Selling</h3>
                    <p className="text-sm text-gray-500 mb-6">Most popular items this week</p>

                    <div className="flex-1 space-y-4">
                        {topSelling.length > 0 ? (
                            topSelling.map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[#fcf9f2] rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <Package className="h-5 w-5 text-[#2D5F3F]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#2D5F3F]">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.sales} sold</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.status === 'Trending'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {product.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No sales data yet</p>
                            </div>
                        )}
                    </div>

                    <Link href="/dashboard/seller/products">
                      <Button variant="outline" className="w-full mt-6 border-dashed border-[#2D5F3F]/30 text-[#2D5F3F] hover:bg-[#fcf9f2]">
                          View All Products
                      </Button>
                    </Link>
                </div>
            </div>

            {/* Bottom Section: Recent Orders + Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#2D5F3F]">Recent Orders</h3>
                        <Link href="/dashboard/seller/orders" className="text-sm font-medium text-[#2D5F3F] hover:underline">
                            View All Orders
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        {recentOrders.length > 0 ? (
                            <table className="w-full">
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-[#fcf9f2]/50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-50 p-2 rounded-lg">
                                                        <Package className="h-5 w-5 text-gray-400 group-hover:text-[#2D5F3F]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#2D5F3F]">Order {order.id}</p>
                                                        <p className="text-xs text-gray-500">{order.items} • {order.total}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-500 text-right">
                                                {order.date}
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <Link href={`/dashboard/seller/orders/${order.orderId}`}>
                                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#2D5F3F]">
                                                        Details
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No orders yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Panel */}
                <div className="h-full">
                    <SellerFeedbackPanel />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-[#2D5F3F]">{value}</span>
                    </div>
                </div>
                <div className="p-2 rounded-lg bg-[#f8f5f2] text-[#2D5F3F]">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
