import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Edit, Sparkles, Camera } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ProductsFilter } from "@/components/seller/ProductsFilter";
import { BulkUploadButton } from "@/components/seller/BulkUploadButton";
import { DeleteProductButton } from "@/components/seller/DeleteProductButton";
import { getProductImages } from "@/lib/utils";

export default async function ProductsPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
    });

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Found</h2>
                <p className="text-gray-500 mb-6">You need to create a shop before adding products.</p>
                <Link href="/become-seller">
                    <Button>Create Shop</Button>
                </Link>
            </div>
        );
    }

    const products = await prisma.product.findMany({
        where: {
            shopId: shop.id,
            name: {
                contains: query,
            }
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">


            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* Toolbar: Search & Add Product */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <ProductsFilter />
                    <div className="flex gap-2">
                      <BulkUploadButton shopId={shop.id} />
                      <Link href="/dashboard/seller/products/bulk-ai" className="inline-flex items-center gap-2 border border-[#2D5F3F] text-[#2D5F3F] hover:bg-green-50 font-medium px-4 py-2 rounded-lg text-sm">
                        <Camera className="w-4 h-4" /> Bulk AI Listing
                      </Link>
                      <Link href="/dashboard/seller/products/new" className="inline-flex items-center gap-2 bg-[#2D5F3F] hover:bg-[#1a3a28] text-white font-medium px-4 py-2 rounded-lg text-sm">
                        <Sparkles className="w-4 h-4" /> Add Product
                      </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-[#f9fafb]">
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Product</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Price</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Stock</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        No products found. Start by adding your first product!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image could go here if detailed, standard list usually has name mostly */}
                                                <div className="h-10 w-10 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {getProductImages(product.images).length > 0 ? (
                                                        <Image
                                                            src={getProductImages(product.images)[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-[#2D5F3F]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${product.inventory > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {product.inventory > 0 ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-medium text-[#2D5F3F]">
                                            {Number(product.price).toFixed(2)} Kr
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            {product.inventory}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/dashboard/seller/products/${product.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#2D5F3F]" title="Edit Product">
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                                <DeleteProductButton productId={product.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
