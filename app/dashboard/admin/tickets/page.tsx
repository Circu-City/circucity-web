import prisma from '@/lib/prisma';

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

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
import { LifeBuoy } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';

export default async function AdminTicketsPage() {
    const tickets = await prisma.ticket.findMany({
        include: {
            user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Support Tickets</h1>
                    <p className="text-sm text-gray-500">Manage customer support requests</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search tickets..." />
                    </Suspense>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <LifeBuoy className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No support tickets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-mono text-xs text-gray-500">
                                        #{ticket.id.slice(-8).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                                    <TableCell>{ticket.user.name || ticket.user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{ticket.priority}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
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
