import { Metadata } from "next";

// Force dynamic rendering (requires database access)
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import prisma from "@/lib/prisma";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSort } from "@/components/products/ProductSort";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { auth } from '@clerk/nextjs/server';
import { getUserWishlistProductIds } from '@/lib/wishlist';

import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
    title: "All Products | CircuCity",
    description: "Browse our collection of eco-friendly, sustainable products.",
};

interface SearchParams {
    category?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    sort?: string;
    query?: string;
    search?: string; // Added for search functionality
    page?: string;
    limit?: string;
}

export default async function ProductsPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const { userId } = await auth();
    const wishlistProductIds = await getUserWishlistProductIds(userId);
    const searchParams = await props.searchParams;

    // Process search params
    const categoryFilter = searchParams.category
        ? (Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category])
        : undefined;

    const conditionFilter = searchParams.condition
        ? (Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition])
        : undefined;

    const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
    const minCo2 = searchParams.minCo2 ? Number(searchParams.minCo2) : undefined;
    const maxCo2 = searchParams.maxCo2 ? Number(searchParams.maxCo2) : undefined;
    const sort = searchParams.sort || 'newest';
    const searchQuery = searchParams.search || searchParams.query; // Support both 'search' and 'query' params

    // Construct Prisma query
    const where: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        // Search filter - searches in name and description
        ...(searchQuery && {
            OR: [
                { name: { contains: searchQuery } },
                { description: { contains: searchQuery } },
            ]
        }),
        ...(categoryFilter && categoryFilter.length > 0 && {
            category: {
                name: { in: categoryFilter }
            }
        }),
        ...(conditionFilter && conditionFilter.length > 0 && {
            condition: { in: conditionFilter as any } // Cast as any to avoid strict enum typing issues in WhereInput
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
    };

    // Sort mapping
    const orderBy: Prisma.ProductOrderByWithRelationInput =
        sort === 'price-asc' ? { price: 'asc' } :
            sort === 'price-desc' ? { price: 'desc' } :
                { createdAt: 'desc' }; // default 'newest'

    // Pagination logic
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 12; // Default 12 products per page
    const skip = (page - 1) * limit;

    // Fetch products and total count
    const [productsRaw, totalProducts] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
            },
            orderBy,
            skip,
            take: limit,
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

    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch categories for sidebar filter
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
    });

    return (
        <div className="min-h-screen bg-[#f8f5f2]"> {/* Beige background as per request image style */}

            {/* Header / Breadcrumb Component Area */}
            <div className="bg-[#2D5F3F] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <nav className="flex items-center text-xs sm:text-sm text-gray-300 mb-4 space-x-2">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
                        {categoryFilter && categoryFilter.length > 0 && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-white font-medium">{categoryFilter.length === 1 ? categoryFilter[0] : `${categoryFilter.length} categories`}</span>
                            </>
                        )}
                    </nav>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-serif">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg">
                        {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found {searchQuery ? `matching "${searchQuery}"` : 'matching your criteria'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>

                    {/* Sidebar Filters */}
                    {/* Sticky handled internally or via wrapper, mostly internal sticky content */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <ProductFilters categories={categories} />
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1">

                        {/* Toolbar: Sort & Count */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-200 gap-4">
                            <div className="text-sm text-gray-500 font-medium">
                                Showing {products.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalProducts)} of {totalProducts} results
                            </div>

                            <ProductSort />
                        </div>

                        {/* Grid */}
                        <ProductGrid products={products} />

                        {/* Pagination */}
                        {totalProducts > limit && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <PaginationControls
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalItems={totalProducts}
                                    itemsPerPage={limit}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
