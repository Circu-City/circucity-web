'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/providers/CartProvider';
import { useEffect, useState } from 'react';

export function CartButton() {
    const { state } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Link href="/cart">
            <Button variant="ghost" size="icon" className="hover:text-primary relative">
                <ShoppingCart className="h-6 w-6" />
                {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                        {itemCount}
                    </span>
                )}
                <span className="sr-only">Cart</span>
            </Button>
        </Link>
    );
}
