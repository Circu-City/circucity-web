"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/app/actions/stripe';
import { Loader2 } from 'lucide-react';

export function CheckoutButton({ priceId }: { priceId: string }) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            await createCheckoutSession(priceId);
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleCheckout} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Checkout
        </Button>
    );
}
