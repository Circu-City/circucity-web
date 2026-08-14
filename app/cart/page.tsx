'use client';

import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { createCartCheckoutSession } from '@/app/actions/stripe';
import { formatPrice, calculateShieldFee } from '@/lib/pricing';
import { useState, useEffect } from 'react';
import { CartUpsell } from '@/components/cart/CartUpsell';

const RATES: Record<number, number> = { 3: 77.60, 5: 106.40, 10: 143.20, 15: 175.20, 20: 205.60, 25: 271.20, 30: 317.60 };
const HANDLING = 0.10;

export default function CartPage() {
    const { state, removeItem, updateQuantity } = useCart();
    const { items } = state;
    const [shippingOption, setShippingOption] = useState<'postnord' | 'shipmondo'>('postnord');
    const [shipmondoPrice, setShipmondoPrice] = useState<number | null>(null);
    const [loadingShipmondo, setLoadingShipmondo] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shieldFee = items.length > 0 ? calculateShieldFee(subtotal) : 0;

    const totalWeight = items.reduce((acc, item) => acc + ((item as any).weight || 0.5) * item.quantity, 0);
    const tiers = Object.keys(RATES).map(Number).sort((a,b) => a - b);
    const tier = tiers.find(t => t >= totalWeight) || 30;
    const postnordShipping = totalWeight > 0 ? parseFloat((RATES[tier] * (1 + HANDLING)).toFixed(2)) : 0;
    const displayedShipping = shippingOption === 'shipmondo' && shipmondoPrice !== null ? shipmondoPrice : postnordShipping;
    const isFreeShipping = subtotal >= 2000;

    useEffect(() => {
        if (items.length === 0) return;
        setLoadingShipmondo(true);
        fetch('/api/shipping/rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weight: totalWeight }) })
            .then(r => r.json())
            .then(d => { if (d.shipmondo) setShipmondoPrice(d.shipmondo); })
            .catch(() => setShipmondoPrice(null))
            .finally(() => setLoadingShipmondo(false));
    }, [totalWeight, items.length]);

    const shipping = isFreeShipping ? 0 : displayedShipping;
    const total = subtotal + shieldFee + shipping;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8f5f2] py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/products">
                        <Button className="w-full bg-[#2D5F3F] hover:bg-[#152a22] text-white">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f5f2] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">Shopping Cart</h1>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <li key={item.id} className="p-6 flex gap-6">
                                        <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/products/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-[#2D5F3F] transition-colors line-clamp-1">{item.name}</Link>
                                            <p className="text-[#2D5F3F] font-bold mt-1">{formatPrice(item.price)}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-gray-50 text-gray-600"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50 text-gray-600"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove item"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span><span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shield Fee</span><span className="font-medium text-gray-900">{formatPrice(shieldFee)}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    <span className="text-sm font-medium text-gray-700 mb-2 block">Shipping Method</span>
                                    <div className="space-y-2">
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${shippingOption === 'postnord' ? 'border-[#2D5F3F] bg-[#E7F0E9]' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="shipping" checked={shippingOption === 'postnord'} onChange={() => setShippingOption('postnord')} className="sr-only" />
                                            <Truck className={`w-5 h-5 ${shippingOption === 'postnord' ? 'text-[#2D5F3F]' : 'text-gray-400'}`} />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-900">PostNord</span>
                                                <span className="text-xs text-gray-500 block">2-5 business days</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{isFreeShipping ? 'Free' : formatPrice(postnordShipping)}</span>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${shippingOption === 'shipmondo' ? 'border-[#2D5F3F] bg-[#E7F0E9]' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="shipping" checked={shippingOption === 'shipmondo'} onChange={() => setShippingOption('shipmondo')} className="sr-only" />
                                            <Truck className={`w-5 h-5 ${shippingOption === 'shipmondo' ? 'text-[#2D5F3F]' : 'text-gray-400'}`} />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-900">Shipmondo</span>
                                                <span className="text-xs text-gray-500 block">Best rate from multiple carriers</span>
                                            </div>
                                            {loadingShipmondo ? (
                                                <span className="text-xs text-gray-400">Loading...</span>
                                            ) : shipmondoPrice !== null ? (
                                                <span className="text-sm font-bold text-gray-900">{isFreeShipping ? 'Free' : formatPrice(shipmondoPrice)}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Unavailable</span>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex justify-between text-base font-bold text-gray-900">
                                    <span>Total</span><span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <div className="w-full">
                                <SignedIn>
                                    <Button onClick={async () => {
                                        const cartItems = items.map(item => ({ productId: item.id, quantity: item.quantity }));
                                        await createCartCheckoutSession(cartItems, shippingOption);
                                    }} className="w-full bg-[#2D5F3F] hover:bg-[#152a22] text-white py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                                        Checkout <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </SignedIn>
                                <SignedOut>
                                    <Link href="/sign-up?redirect=/cart">
                                        <Button className="w-full bg-[#2D5F3F] hover:bg-[#152a22] text-white py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">Create Account to Checkout <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                    </Link>
                                    <p className="text-xs text-gray-400 text-center mt-2">Already have an account? <Link href="/sign-in?redirect=/cart" className="text-[#2D5F3F] hover:underline">Sign in</Link></p>
                                </SignedOut>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <Link href="/products" className="text-sm text-gray-500 hover:text-[#2D5F3F] underline decoration-gray-300 hover:decoration-[#2D5F3F] transition-all">Continue Shopping</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <CartUpsell />
            </div>
        </div>
    );
}
