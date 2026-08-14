import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { Leaf, Package } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface CategoryPageProps {
    categorySlug: string;
    categoryName: string;
    description: string;
    icon?: React.ReactNode;
    searchParams?: {
        minPrice?: string;
        maxPrice?: string;
        condition?: string | string[];
        minCo2?: string;
        maxCo2?: string;
        inStock?: string;
        page?: string;
        limit?: string;
    };
}

async function getCategoryProducts(categorySlug: string, searchParams?: CategoryPageProps['searchParams']) {
    // Find category by name (case-insensitive)
    const category = await prisma.category.findFirst({
        where: {
            name: {
                equals: categorySlug.replace(/-/g, ' '),
            }
        }
    });

    if (!category) {
        return { products: [], total: 0 };
    }

    // Process search params
    const conditionFilter = searchParams?.condition
        ? (Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition])
        : undefined;

    const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;
    const minCo2 = searchParams?.minCo2 ? Number(searchParams.minCo2) : undefined;
    const maxCo2 = searchParams?.maxCo2 ? Number(searchParams.maxCo2) : undefined;
    const inStockOnly = searchParams?.inStock === 'true';

    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || 12;
    const skip = (page - 1) * limit;

    // Construct Prisma query
    const where: Prisma.ProductWhereInput = {
        categoryId: category.id,
        status: 'ACTIVE',
        ...(conditionFilter && conditionFilter.length > 0 && {
            condition: { in: conditionFilter as any }
        }),
        ...(minPrice !== undefined || maxPrice !== undefined ? {
            price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
            }
        } : {}),
        ...(minCo2 !== undefined || maxCo2 !== undefined ? {
            co2Saved: {
                ...(minCo2 !== undefined && { gte: minCo2 }),
                ...(maxCo2 !== undefined && { lte: maxCo2 }),
            }
        } : {}),
        ...(inStockOnly && {
            inventory: {
                gt: 0
            }
        })
    };

    const [productsRaw, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                shop: true,
                category: true,
                reviews: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.product.count({ where })
    ]);

    // Serialize products (convert Decimal to number for Client Components)
    const products = productsRaw.map(product => ({
        ...product,
        price: Number(product.price),
        co2Saved: product.co2Saved ? Number(product.co2Saved) : null,
        weight: product.weight ? Number(product.weight) : null
    }));

    return { products, total };
}

import { auth } from '@clerk/nextjs/server';
import { getUserWishlistProductIds } from '@/lib/wishlist';

async function CategoryProductsContent({ categorySlug, searchParams }: { categorySlug: string; searchParams?: CategoryPageProps['searchParams'] }) {
    const { products, total } = await getCategoryProducts(categorySlug, searchParams);
    const { userId } = await auth();
    const wishlistProductIds = await getUserWishlistProductIds(userId);

    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || 12;
    const totalPages = Math.ceil(total / limit);

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500">Check back soon for new eco-friendly products!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                        <ProductCard
                            product={product}
                            initialIsWishlisted={wishlistProductIds.includes(product.id)}
                        />
                    </div>
                ))}
            </div>

            {total > limit && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        itemsPerPage={limit}
                    />
                </div>
            )}
        </div>
    );
}

function ProductSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-[4/5] bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    );
}

export async function CategoryPage({ categorySlug, categoryName, description, icon, searchParams }: CategoryPageProps) {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {icon || <Leaf className="w-10 h-10" />}
                        <h1 className="text-4xl font-bold font-serif">{categoryName}</h1>
                    </div>
                    <p className="text-lg text-green-100 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        {description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                            <CategoryFilter categorySlug={categorySlug} />
                        </div>
                    </aside>

                    <main className="flex-1">
                        <Suspense fallback={
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-in fade-in duration-200" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                                        <ProductSkeleton />
                                    </div>
                                ))}
                            </div>
                        }>
                            <CategoryProductsContent categorySlug={categorySlug} searchParams={searchParams} />
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
