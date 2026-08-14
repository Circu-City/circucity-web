'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const stagger = {
    animate: {
        transition: { staggerChildren: 0.12 }
    }
};

const fadeUpItem = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function Hero() {
    const [ratings, setRatings] = useState({ avgRating: 4.9, totalCustomers: 80000 });

    useEffect(() => {
        fetch('/api/reviews/stats')
            .then(r => r.json())
            .then(d => {
                if (d.success && d.data.avgRating > 0) {
                    setRatings({ avgRating: d.data.avgRating, totalCustomers: d.data.totalCustomers });
                }
            })
            .catch(() => {});
    }, []);
    return (
        <section className="relative overflow-hidden bg-[#F5F0E6] px-4 py-10 sm:px-6 lg:px-8 lg:pb-20">
            <div className="absolute top-20 left-0 w-72 h-72 bg-[#2D5F3F]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4D35E]/10 rounded-full blur-3xl" />

            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">

                <motion.div
                    className="z-10 min-w-0"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={fadeUpItem} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
                        <ShoppingBag className="w-4 h-4 text-[#2D5F3F]" />
                        <span className="text-sm font-medium text-gray-800">100% Eco-Friendly & Sustainable</span>
                    </motion.div>

                    <motion.h1 variants={fadeUpItem} className="mb-6 text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl">
                        Your Destination for <span className="text-[#2D5F3F]">Sustainable Living</span>
                    </motion.h1>

                    <motion.p variants={fadeUpItem} className="text-lg text-gray-600 mb-8 max-w-lg">
                        From eco home goods to upcycled fashion, find everything you need to reduce your footprint without compromising on quality.
                    </motion.p>

                    <motion.div variants={fadeUpItem} className="flex flex-wrap items-center gap-6 mb-12">
                        <Link href="/products" className="px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full flex items-center gap-2 hover:bg-[#e6c235] hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl font-bold">
                            Shop Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/products" className="text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-[#2D5F3F] transition-colors font-medium">
                            Explore Categories
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUpItem} className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
                            ].map((src, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                    <Image src={src} alt="Customer" width={40} height={40} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-[#F4D35E] flex items-center justify-center text-sm font-bold text-[#2D5F3F] shadow-sm">
                                +
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-neutral-900">{ratings.avgRating} Ratings+</div>
                            <div className="text-sm text-gray-600">Trusted Eco Friendly Shoppers</div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="relative min-w-0"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="relative z-10">
                        <img
                            src="/hero-image.png"
                            alt="Woman wearing sustainable clothes"
                            className="h-auto max-h-[420px] w-full object-contain sm:max-h-[560px]"
                        />
                    </div>

                    <motion.div
                        className="absolute right-0 top-1/4 z-20 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: [0, -8, 0] }}
                        transition={{ delay: 0.8, duration: 0.5, y: { duration: 4, repeat: Infinity } }}
                    >
                        <div className="p-2 bg-[#2D5F3F] rounded-full">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-neutral-900">Secure Payment</div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-24 left-0 z-20 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: [0, -8, 0] }}
                        transition={{ delay: 1.0, duration: 0.5, y: { duration: 4.5, repeat: Infinity, delay: 0.5 } }}
                    >
                        <div className="p-2 bg-[#2D5F3F] rounded-full">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-neutral-900">Eco-Shipping</div>
                        </div>
                    </motion.div>

                    <div className="absolute top-10 right-20 text-[#F4D35E] animate-pulse">
                        <Zap className="w-8 h-8 fill-current drop-shadow-lg" />
                    </div>

                    <div className="absolute bottom-20 right-10 text-[#F4D35E] animate-pulse" style={{ animationDelay: '0.75s' }}>
                        <Star className="w-6 h-6 fill-current drop-shadow-lg" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
