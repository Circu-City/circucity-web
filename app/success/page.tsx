"use client";

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Leaf, Trees, Droplets, ArrowRight, Award } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCart();
    const [impact, setImpact] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            clearCart();
        }
        fetch('/api/order/latest')
            .then(r => r.json())
            .then(data => {
                if (data.order?.items?.length > 0) {
                    const impact = data.order.co2Impact;
                    setImpact({
                        co2Saved: impact.totalCo2Saved,
                        treesEquivalent: impact.treesEquivalent,
                        waterSaved: impact.waterSaved,
                        itemCount: data.order.items.length,
                        orderTotal: data.order.total,
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [sessionId, clearCart]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-emerald-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#2D5F3F] to-[#4a8f5e] p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Payment Successful!</h1>
                    <p className="text-green-200 mt-1">Thank you for your eco-conscious purchase.</p>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-16 bg-gray-100 rounded-xl" />
                            <div className="h-16 bg-gray-100 rounded-xl" />
                        </div>
                    ) : impact && impact.co2Saved > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
                            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <Leaf className="w-5 h-5" /> Your Impact This Purchase
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-white/70 rounded-xl">
                                    <p className="text-2xl font-bold text-green-700">{impact.co2Saved.toFixed(1)}</p>
                                    <p className="text-[10px] text-green-600 font-medium">kg CO₂ Saved</p>
                                </div>
                                <div className="text-center p-3 bg-white/70 rounded-xl">
                                    <Trees className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-green-700">{impact.treesEquivalent}</p>
                                    <p className="text-[10px] text-green-600 font-medium">Trees Equivalent</p>
                                </div>
                                <div className="text-center p-3 bg-white/70 rounded-xl">
                                    <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-blue-600">{impact.waterSaved}L</p>
                                    <p className="text-[10px] text-blue-500 font-medium">Water Saved</p>
                                </div>
                            </div>
                            <p className="text-xs text-green-700 mt-3 text-center">
                                Your sustainable choices make a real difference for our planet!
                            </p>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Eco Tokens Earned!</p>
                            <p className="text-xs text-amber-700">You earned eco tokens for this purchase. Check your dashboard to see your total impact and redeem rewards.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <a href="/dashboard/orders" className="flex items-center justify-between w-full bg-[#2D5F3F] hover:bg-[#1a3a28] text-white font-medium py-3 px-5 rounded-xl transition-colors">
                            View My Orders <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="/dashboard/buyer" className="flex items-center justify-between w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-5 rounded-xl border border-gray-200 transition-colors">
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                        <div className="h-4 bg-gray-200 rounded w-full mx-auto" />
                        <div className="h-16 bg-gray-100 rounded-xl" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}