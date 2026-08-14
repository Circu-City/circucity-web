'use client'; // Client Component for interactivity

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Leaf } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Product } from '@prisma/client';
import { toggleWishlist } from '@/app/actions/wishlist'; // Import server action
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';
import { getProductImages } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';

// Serialized product type for Client Components (Decimal -> number)
type SerializedProduct = Omit<Product, 'price' | 'co2Saved' | 'weight'> & {
    price: number;
    co2Saved: number | null;
    weight: number | null;
};

interface ProductCardProps {
    product: SerializedProduct & { category: { name: string } };
    initialIsWishlisted?: boolean; // Pass improved initial state if possible in future
}

export function ProductCard({ product, initialIsWishlisted = false }: ProductCardProps) {
    const images = getProductImages(product.images);
    const mainImage = images[0] || '/placeholder.png';
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [isLoading, setIsLoading] = useState(false);
    const { isSignedIn } = useAuth(); // Check user auth on client side for immediate feedback
    const { addItem, state } = useCart();
    const isInCart = state.items.some(item => item.id === product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInCart) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: mainImage,
            weight: product.weight ? Number(product.weight) : 0.5
        });
        toast.success(`Added "${product.name}" to cart`);
    };

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product details
        e.stopPropagation();

        if (!isSignedIn) {
            toast.error("Please sign in to add to your wishlist!");
            return;
        }

        setIsLoading(true);
        try {
            const result = await toggleWishlist(product.id);
            if (result.success && result.isWishlisted !== undefined) {
                setIsWishlisted(result.isWishlisted);
                toast.success(result.isWishlisted ? "Added to wishlist!" : "Removed from wishlist!");
            } else {
                toast.error("Something went wrong with your wishlist.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update wishlist.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="group rounded-2xl p-4 transition-all duration-300 hover:border-[#2D5F3F] border border-transparent bg-transparent hover:bg-white relative">
            {product.inventory <= 0 && (
                <div className="absolute inset-4 bg-white/50 z-10 flex items-center justify-center rounded-2xl">
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-red-100 rotate-12 shadow-sm">
                        Sold Out
                    </span>
                </div>
            )}

            <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4">
                <Link href={`/products/${product.id}`} className="block w-full h-full relative">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ${product.inventory <= 0 ? 'grayscale' : ''}`}
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                    <Badge className="bg-white/90 text-[#2D5F3F] backdrop-blur-md text-xs font-bold border-transparent shadow-sm">
                        Eco
                    </Badge>
                    {/* Logic for "New" badge could be added here based on CreatedAt */}
                    {new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-[#F4D35E] text-[#2D5F3F] backdrop-blur-md text-xs font-bold border-transparent shadow-sm">
                            New
                        </Badge>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    disabled={isLoading}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm z-20 
                        ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'}
                    `}
                >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
                </button>

                {/* Add to Cart Button - Appears on Hover */}
                {product.inventory > 0 && (
                    <button
                        onClick={handleAddToCart}
                        className={`absolute bottom-4 left-4 right-4 py-3 font-bold rounded-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg flex items-center justify-center gap-2 z-20 ${
                            isInCart
                                ? 'bg-green-600 text-white'
                                : 'bg-white/90 backdrop-blur-md text-[#2D5F3F] hover:bg-[#2D5F3F] hover:text-white'
                        }`}
                        disabled={isInCart}
                    >
                        {isInCart ? (
                            <>✓ Added to Cart</>
                        ) : (
                            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                        )}
                    </button>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500 font-medium">
                        {product.category.name}
                    </div>
                    {/* CO2 Saved - if applicable */}
                    {product.co2Saved && product.co2Saved > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#2D5F3F] font-bold bg-[#E7F0E9] px-2 py-0.5 rounded text-left">
                            <Leaf className="w-3 h-3" />
                            {product.co2Saved}kg
                        </div>
                    )}
                </div>
                <Link href={`/products/${product.id}`} className="block mb-2">
                    <h3 className="font-bold text-lg text-neutral-900 line-clamp-1 group-hover:text-[#2D5F3F] transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-[#2D5F3F]">
                        {formatPrice(product.price)}
                    </span>
                    {/* Placeholder for original price if implemented later */}
                    {/* <span className="text-sm text-gray-400 line-through">$45.00</span> */}
                </div>
            </div>
        </div>
    );
}
