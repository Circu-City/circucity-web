'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/pricing";

interface AddToCartProps {
    productId: string;
    price: number;
    productName: string;
    image?: string;
}

export function AddToCart({ productId, price, productName, image }: AddToCartProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = async () => {
        setIsAdding(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        addItem({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity,
            image: image
        });

        setIsAdding(false);
        // Reset quantity after adding? Or keep it? Usually keep it.
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 rounded-lg bg-white w-fit">
                <button
                    onClick={handleDecrement}
                    className="p-3 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                <button
                    onClick={handleIncrement}
                    className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                className="flex-1 bg-[#2D5F3F] hover:bg-[#152a22] text-white py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isAdding}
            >
                {isAdding ? (
                    <span className="flex items-center gap-2">
                        Adding...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart - {formatPrice(price * quantity)}
                    </span>
                )}
            </Button>
        </div>
    );
}
