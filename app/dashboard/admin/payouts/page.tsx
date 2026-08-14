import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Banknote, Check, X, RotateCw } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';
import { PayoutActions } from './PayoutActions';

export default async function AdminPayoutsPage(props: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';

    const where: any = {};
    if (query) {
        where.shop = { name: { contains: query } };
    }

    const [payouts, totalPending, totalPaid, pendingAmount] = await Promise.all([
        prisma.payout.findMany({
            where,
            include: { shop: { select: { name: true, ownerId: true } } },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            take: 100,
        }),
        prisma.payout.count({ where: { status: 'PENDING' } }),
        prisma.payout.count({ where: { status: 'PAID' } }),
        prisma.payout.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
    ]);

    const statusColor = (s: string) => {
        const m: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            PROCESSING: 'bg-blue-100 text-blue-700',
            PAID: 'bg-green-100 text-green-700',
            FAILED: 'bg-red-100 text-red-700',
        };
        return m[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payouts</h1>
                    <p className="text-sm text-gray-500">Manage seller payouts and commissions</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search by shop name..." />
                    </Suspense>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Payouts', value: payouts.length, color: 'bg-blue-50', text: 'text-blue-600' },
                    { label: 'Pending', value: totalPending, color: 'bg-yellow-50', text: 'text-yellow-600' },
                    { label: 'Paid', value: totalPaid, color: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Pending Amount', value: `${(Number(pendingAmount._sum.amount) || 0).toFixed(0)} kr`, color: 'bg-red-50', text: 'text-red-600' },
                ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                        <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Payout ID</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Created</TableHead>
                            <TableHead className="text-right">Processed</TableHead>
                            <TableHead className="text-right w-[160px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                    <Banknote className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No payouts found. Payouts are created when sellers earn from delivered orders.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout) => (
                                <TableRow key={payout.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-mono text-xs text-gray-500">
                                        #{payout.id.slice(-8).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="font-medium">{payout.shop.name}</TableCell>
                                    <TableCell className="font-medium">{Number(payout.amount).toFixed(2)} kr</TableCell>
                                    <TableCell>
                                        <Badge className={statusColor(payout.status)}>{payout.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                        {new Date(payout.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                        {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <PayoutActions payoutId={payout.id} currentStatus={payout.status} />
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
