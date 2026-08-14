import prisma from '@/lib/prisma';

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

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
import { Eye, ShoppingBag } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';
import { Suspense } from 'react';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { SortableHeader } from '@/components/ui/sortable-header';

export default async function AdminOrdersPage(props: {
    searchParams?: Promise<{ q?: string; status?: string; page?: string; limit?: string; sort?: string; order?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const status = searchParams?.status;
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || 10;
    const sort = searchParams?.sort || 'createdAt';
    const order = searchParams?.order === 'asc' ? 'asc' : 'desc';

    const where: any = {};

    if (query) {
        where.OR = [
            { id: { contains: query } },
            { shippingName: { contains: query } },
            { user: { email: { contains: query } } },
            { user: { name: { contains: query } } }
        ];
    }

    if (status && status !== 'ALL') {
        where.status = status;
    }

    // Construct orderBy object
    let orderBy: any = {};
    if (sort === 'customer') {
        orderBy = { user: { name: order } };
    } else if (sort === 'items') {
        orderBy = { items: { _count: order } };
    } else {
        orderBy = { [sort]: order };
    }

    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: true,
                items: true,
                _count: {
                    select: { items: true }
                }
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500">Manage and view all customer orders</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search orders..." />
                    </Suspense>
                    <Link
                        href="/dashboard/admin/orders"
                        className="px-3 py-2 bg-white border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </Link>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[600px]">
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                <TableHead className="w-[120px]">
                                    <SortableHeader column="id" label="Order ID" />
                                </TableHead>
                                <TableHead>
                                    <SortableHeader column="customer" label="Customer" />
                                </TableHead>
                                <TableHead>
                                    <SortableHeader column="status" label="Status" />
                                </TableHead>
                                <TableHead className="text-center">
                                    <SortableHeader column="items" label="Items" />
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex justify-end">
                                        <SortableHeader column="total" label="Total" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex justify-end">
                                        <SortableHeader column="createdAt" label="Date" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                        <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                        No orders found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-mono text-xs text-gray-500 font-medium">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {order.shippingName || order.user?.name || 'Guest'}
                                                </span>
                                                <span className="text-xs text-gray-500">{order.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={`
                                                    ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : ''}
                                                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                    ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-700' : ''}
                                                    ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                                                    ${order.status === 'REFUNDED' ? 'bg-orange-100 text-orange-700' : ''}
                                                `}
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-gray-600">
                                            {order._count.items}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-gray-900">
                                            {Number(order.total).toFixed(2)} Kr
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/dashboard/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t border-gray-100 bg-gray-50/50">
                    <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalOrders}
                        itemsPerPage={limit}
                    />
                </div>
            </div>
        </div>
    );
}
