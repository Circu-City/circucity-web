'use client';

import { useCart } from '@/components/providers/CartProvider';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCart() {
    const { state } = useCart();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (itemCount > 0) setVisible(true);
    }, [itemCount]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {visible && itemCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    className="fixed bottom-6 right-6 z-50 md:hidden"
                >
                    <Link href="/cart" className="flex items-center justify-center w-14 h-14 bg-[#2D5F3F] text-white rounded-full shadow-xl hover:bg-[#1a3a28] transition-colors relative">
                        <ShoppingCart className="w-6 h-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
