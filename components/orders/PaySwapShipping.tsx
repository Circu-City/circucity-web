'use client';

import { useState } from 'react';
import { createSwapShippingSession } from '@/app/actions/stripe';
import { useSearchParams } from 'next/navigation';
import { Truck, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface PaySwapShippingProps {
    orderId: string;
    stripeChargeId: string | null;
    total: number;
    paid: boolean;
}

export default function PaySwapShipping({
    orderId,
    stripeChargeId,
    total,
    paid,
}: PaySwapShippingProps) {
    const searchParams = useSearchParams();
    const shippingPaid = searchParams.get('shipping_paid') === 'true';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Show only on swap orders (stripeChargeId starts with "swap_")
    const isSwapOrder = (stripeChargeId || '').startsWith('swap_');

    if (!isSwapOrder) return null;

    if (paid && total > 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                    <p className="font-medium text-green-900">Shipping Paid</p>
                    <p className="text-sm text-green-700">
                        Shipping cost of {total.toFixed(2)} Kr has been paid.
                        The seller will prepare your item for shipment.
                    </p>
                </div>
            </div>
        );
    }

    const handlePayShipping = async () => {
        setLoading(true);
        setError(null);
        try {
            await createSwapShippingSession(orderId);
        } catch (e: any) {
            setError(e.message || 'Failed to start payment');
            setLoading(false);
        }
    };

    return (
        <div>
            {shippingPaid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-sm text-green-800">
                        Payment successful! Your shipping is being processed.
                    </p>
                </div>
            )}

            {!paid && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <Truck className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 text-lg">
                                Pay for Shipping
                            </h3>
                            <p className="text-blue-700 mt-1">
                                This swap item is paid with EcoTokens. You still need to
                                pay for shipping. Click below to enter your address and
                                complete the shipping payment.
                            </p>

                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}

                            <button
                                type="button"
                                onClick={handlePayShipping}
                                disabled={loading}
                                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        Pay Shipping Now
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
