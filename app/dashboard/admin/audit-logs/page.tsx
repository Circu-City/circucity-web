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
import { ShieldAlert } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';

export default async function AdminAuditLogsPage() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
                    <p className="text-sm text-gray-500">System activity and security logs</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search logs..." />
                    </Suspense>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>By</TableHead>
                            <TableHead className="w-[40%]">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                    <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-gray-50/50">
                                    <TableCell className="text-xs text-gray-500 font-mono">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{log.action}</TableCell>
                                    <TableCell className="text-sm">
                                        {log.entity} <span className="text-gray-400 text-xs">#{log.entityId.slice(-6)}</span>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">{log.performedBy}</TableCell>
                                    <TableCell className="text-xs text-gray-600 font-mono truncate max-w-[300px]">
                                        {log.details || '-'}
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
