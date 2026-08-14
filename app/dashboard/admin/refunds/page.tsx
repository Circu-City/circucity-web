import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Undo2, AlertCircle } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';

export default async function AdminRefundsPage(props: {
    searchParams?: Promise<{ q?: string; status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';

    // Filter for orders that are involved in returns/refunds/disputes
    const where: any = {
        OR: [
            { status: 'REFUNDED' },
            { status: 'PARTIALLY_REFUNDED' },
            { status: 'DISPUTED' },
            { status: 'CANCELLED' }, // Cancellations often need refund review
            { cancellationReason: { not: null } }
        ]
    };

    if (query) {
        // Add query filter if needed
        where.AND = [
            {
                OR: [
                    { id: { contains: query } },
                    { user: { email: { contains: query } } }
                ]
            }
        ]
    }

    const refunds = await prisma.order.findMany({
        where,
        include: {
            user: true,
            items: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Refunds &amp; Disputes</h1>
                    <p className="text-sm text-gray-500">Manage refund requests and disputes</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search refunds..." />
                    </Suspense>
                    <Link
                        href="/dashboard/admin/refunds"
                        className="px-3 py-2 bg-white border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </Link>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {refunds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    <Undo2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No refunds or disputes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            refunds.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-mono text-xs text-gray-500">
                                        #{order.id.slice(-8).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900">{order.user?.name || 'Guest'}</span>
                                            <span className="text-xs text-gray-500">{order.user?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'DISPUTED' ? 'destructive' : 'secondary'}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.refundAmount ? Number(order.refundAmount).toFixed(2) : Number(order.total).toFixed(2)} Kr
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-gray-600 truncate max-w-[200px] block" title={order.cancellationReason || ''}>
                                            {order.cancellationReason || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                        {new Date(order.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/admin/orders/${order.id}`} className="text-blue-600 hover:underline text-xs">
                                            Manage
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
