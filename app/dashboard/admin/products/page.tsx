import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Package, ExternalLink, Star, Trash2, Eye } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';
import { ProductActions } from './ProductActions';
import { getProductImages } from '@/lib/utils';

export default async function AdminProductsPage(props: {
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
            { shop: { name: { contains: query } } }
        ];
    }
    if (status && status !== 'ALL') {
        where.moderationStatus = status;
    }

    const [products, totalCount, activeCount, outOfStockCount] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                shop: { select: { name: true, owner: { select: { email: true } } } },
                category: true,
                _count: { select: { orderItems: true, reviews: true, views: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        }),
        prisma.product.count(),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count({ where: { status: 'OUT_OF_STOCK' } }),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">{totalCount} total · {activeCount} active · {outOfStockCount} out of stock</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search products..." />
                    </Suspense>
                    <Link href="/dashboard/admin/products" className="px-3 py-2 bg-white border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Reset</Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Products', value: totalCount, color: 'bg-blue-50', text: 'text-blue-600' },
                    { label: 'Active', value: activeCount, color: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Out of Stock', value: outOfStockCount, color: 'bg-red-50', text: 'text-red-600' },
                    { label: 'Showing', value: products.length, color: 'bg-purple-50', text: 'text-purple-600' },
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
                            <TableHead className="w-[60px]">Img</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Moderation</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Orders</TableHead>
                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                                            {getProductImages(product.images)[0] ? (
                                                <img src={getProductImages(product.images)[0]} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300"><Package className="w-5 h-5" /></div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900 truncate max-w-[200px] flex items-center gap-1">
                                                {product.name}
                                                {product.isFeatured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{product.id.slice(-8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-700">{product.shop?.name || '—'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-gray-500">{product.category?.name || '—'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`
                                            ${product.moderationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : ''}
                                            ${product.moderationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                                            ${product.moderationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {product.moderationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-sm">
                                        {Number(product.price).toFixed(0)} kr
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`text-sm font-medium ${product.inventory === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {product.inventory}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-gray-500">
                                        {product._count.orderItems}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/products/${product.id}`} target="_blank"
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600" title="View live">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <ProductActions
                                                productId={product.id}
                                                currentStatus={product.moderationStatus}
                                                isFeatured={product.isFeatured}
                                            />
                                        </div>
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
