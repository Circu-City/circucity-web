import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import { auth } from '@clerk/nextjs/server';
import { getUserWishlistProductIds } from '@/lib/wishlist';
import { Prisma } from '@prisma/client';

type ProductWithCategory = Prisma.ProductGetPayload<{
    include: { category: true }
}>;

type SerializedProduct = Omit<ProductWithCategory, 'price' | 'co2Saved' | 'weight'> & {
    price: number;
    co2Saved: number | null;
    weight: number | null;
};


async function getFeaturedProducts(): Promise<SerializedProduct[]> {
    try {
        // Try to get featured products first
        let products = await prisma.product.findMany({
            where: {
                isFeatured: true,
                status: 'ACTIVE'
            },
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true
            }
        });

        // Fallback to latest products if no featured ones found
        if (products.length === 0) {
            products = await prisma.product.findMany({
                where: { status: 'ACTIVE' },
                take: 4,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true
                }
            });
        }

        // Convert Decimal fields to numbers for Client Component serialization
        return products.map(product => ({
            ...product,
            price: Number(product.price),
            co2Saved: product.co2Saved ? Number(product.co2Saved) : null,
            weight: product.weight ? Number(product.weight) : null
        }));
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

export async function FeaturedProducts() {
    const products = await getFeaturedProducts();
    const { userId } = await auth();
    const wishlistProductIds = await getUserWishlistProductIds(userId);

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Featured Products</h2>
                    </div>
                    <Link href="/products" className="text-[#2D5F3F] font-semibold flex items-center gap-2 hover:gap-3 transition-all shrink-0">
                        View All <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            initialIsWishlisted={wishlistProductIds.includes(product.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
