import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default async function WishlistPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    // Serialize products (convert Decimal to number for Client Components)
    const products = wishlist?.items.map(item => ({
        ...item.product,
        price: Number(item.product.price),
        co2Saved: item.product.co2Saved ? Number(item.product.co2Saved) : null,
        weight: item.product.weight ? Number(item.product.weight) : null
    })) || [];

    return (
        <div className="container mx-auto px-4 py-8 min-h-[60vh]">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-50 rounded-full">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-gray-500 mt-1">
                        {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="inline-flex p-4 bg-white rounded-full shadow-sm mb-4">
                        <Heart className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Save items you love to your wishlist so you can easily find them later.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#2D5F3F] px-8 text-sm font-medium text-white shadow transition-colors hover:bg-[#2D5F3F]/90"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            initialIsWishlisted={true} // Since we are on wishlist page, it is definitely wishlisted
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
