'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/pricing';

type UpsellProduct = {
    id: string;
    name: string;
    price: number;
    image: string | null;
    category: string;
};

export function CartUpsell() {
    const { state } = useCart();
    const itemIds = state.items.map((i) => i.id).join(',');
    const [products, setProducts] = useState<UpsellProduct[]>([]);

    useEffect(() => {
        if (!itemIds) {
            setProducts([]);
            return;
        }
        let cancelled = false;
        fetch('/api/cart/complementary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: itemIds.split(',') }),
        })
            .then((r) => r.json())
            .then((d) => { if (!cancelled) setProducts(Array.isArray(d.products) ? d.products : []); })
            .catch(() => { if (!cancelled) setProducts([]); });
        return () => { cancelled = true; };
    }, [itemIds]);

    if (products.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">You might also need</h2>
            <p className="text-sm text-gray-500 mb-6">Pairs well with what's in your cart</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {products.map((p) => (
                    <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="flex-shrink-0 w-40 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                        <div className="relative w-full aspect-square bg-gray-100">
                            {p.image ? (
                                <Image src={p.image} alt={p.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-sm font-bold text-[#2D5F3F] mt-1">{formatPrice(p.price)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
