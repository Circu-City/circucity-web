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
import { Store, User } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';
import { ShopStatusActions } from './ShopActions';

export default async function AdminSellersPage(props: {
    searchParams?: Promise<{ q?: string; status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const status = searchParams?.status;

    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { description: { contains: query } },
            { owner: { email: { contains: query } } },
            { owner: { name: { contains: query } } }
        ];
    }

    if (status && status !== 'ALL') {
        where.status = status;
    }

    const shops = await prisma.shop.findMany({
        where,
        include: {
            owner: true,
            _count: {
                select: { products: true, payouts: true } // Assuming payouts relation exists from previous step
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sellers Management</h1>
                    <p className="text-sm text-gray-500">Approve, suspend, and manage sellers</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search sellers..." />
                    </Suspense>
                    <Link
                        href="/dashboard/admin/sellers"
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
                            <TableHead>Shop Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Products</TableHead>
                            <TableHead className="text-right">Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <Store className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No sellers found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            shops.map((shop) => (
                                <TableRow key={shop.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900">{shop.name}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[200px]">{shop.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                {shop.owner?.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={shop.owner.image} alt={shop.owner.name || ''} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <User className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{shop.owner?.name || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{shop.owner?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={shop.status === 'ACTIVE' ? 'default' : 'secondary'}
                                            className={`
                                                ${shop.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                ${shop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                                ${shop.status === 'SUSPENDED' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                                ${shop.status === 'REJECTED' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' : ''}
                                            `}
                                        >
                                            {shop.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-gray-600">
                                        {shop._count.products}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                        {new Date(shop.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ShopStatusActions shopId={shop.id} currentStatus={shop.status} />
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
