
import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, XCircle, Eye, PackagePlus } from 'lucide-react';

export default async function SellerOrdersPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
    });

    if (!shop) {
        redirect('/become-seller');
    }

    // Get orders that contain products from this shop
    const orders = await prisma.order.findMany({
        where: {
            items: {
                some: {
                    product: {
                        shopId: shop.id
                    }
                }
            }
        },
        include: {
            user: true, // buyer info
            items: {
                where: {
                    product: {
                        shopId: shop.id
                    }
                },
                include: {
                    product: true
                }
            },
            shipments: {
                select: {
                    id: true,
                    trackingNumber: true,
                    status: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            </div>

            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[100px]">Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Items</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Total</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No orders found yet.
                                </TableCell>
                            </TableRow>
                        ) : orders.map((order) => {
                            // Calculate total for this shop only
                            const shopTotal = order.items.reduce((acc, item) => {
                                return acc + (Number(item.price) * item.quantity);
                            }, 0);

                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-xs text-gray-500">
                                        #{order.id.slice(-6).toUpperCase()}
                                        {(order.stripeChargeId || '').startsWith('swap_') && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">Swap</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{order.shippingName || order.user?.name || 'Guest'}</span>
                                            <span className="text-xs text-gray-400">{order.user?.email}</span>
                                            {order.shippingCity && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    <Truck className="w-3 h-3" />
                                                    <span>{order.shippingCity}, {order.shippingCountry}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={order.status === 'PAID' ? 'default' : 'secondary'}
                                            className={
                                                order.status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                order.status === 'PARTIALLY_REFUNDED' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                                'bg-gray-100 text-gray-600'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="space-y-1">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="text-sm flex items-center gap-2">
                                                    <span className="bg-gray-100 text-xs px-1.5 py-0.5 rounded font-medium text-gray-600">x{item.quantity}</span>
                                                    <span className="truncate max-w-[200px]">{item.product.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium hidden sm:table-cell">
                                        {shopTotal.toFixed(2)} Kr
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-gray-500 hidden sm:table-cell">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Create Shipment button for PAID orders without shipments */}
                                            {order.status === 'PAID' && order.shipments.length === 0 && (
                                                <Link
                                                    href={`/dashboard/seller/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <PackagePlus className="w-3.5 h-3.5" />
                                                    Create Shipment
                                                </Link>
                                            )}

                                            {/* View Tracking for orders with shipments */}
                                            {order.shipments.length > 0 && (
                                                <Link
                                                    href={`/dashboard/seller/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
                                                >
                                                    <Truck className="w-3.5 h-3.5" />
                                                    View Tracking
                                                </Link>
                                            )}

                                            {/* View Details button for all orders */}
                                            <Link
                                                href={`/dashboard/seller/orders/${order.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
