"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';

interface OrderDetails {
    id: string;
    total: number;
    status: string;
    itemCount: number;
    createdAt: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart, state } = useCart();
    const [orderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Clear cart on successful payment
    useEffect(() => {
        if (sessionId) {
            console.log('Payment successful, clearing cart...');
            console.log('Cart items before clearing:', state.items.length);
            clearCart();
            console.log('✅ Cart cleared successfully');

            // Optional: Fetch order details from your API
            // Uncomment when you create the endpoint
            /*
            fetch(`/api/orders/session/${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    setOrderDetails(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch order details:', err);
                    setLoading(false);
                });
            */
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
        }
    }, [sessionId, clearCart, state.items.length]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-600">
                    Thank you for your purchase. Your order has been confirmed and your cart has been cleared.
                </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ) : orderDetails ? (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium text-gray-900">{orderDetails.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-medium text-gray-900">{orderDetails.itemCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-gray-900">${orderDetails.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {orderDetails.status}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Session ID:</span>
                            <span className="font-mono text-sm text-gray-900">
                                {sessionId?.slice(0, 20)}...
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Your order is being processed. You can view it in your dashboard.
                        </p>
                    </div>
                )}
            </div>

            {/* What&apos;s Next Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>You&apos;ll receive an order confirmation email shortly</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>Track your order status in your dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>We&apos;ll notify you when your order ships</span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/dashboard">
                    <Button variant="default" className="w-full">
                        <Package className="h-4 w-4 mr-2" />
                        View My Orders
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" className="w-full">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Suspense fallback={
                <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
                    <div className="animate-pulse">
                        <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
