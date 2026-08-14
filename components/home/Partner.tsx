'use client';

import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Partner() {
    return (
        <section className="py-20 bg-[#fcf9f2]">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    className="bg-[#2D5F3F] rounded-[3rem] overflow-hidden relative"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D35E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="p-10 md:p-16 flex-1 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                                <ShieldCheck className="w-4 h-4 text-[#F4D35E]" />
                                <span className="text-[#F4D35E] font-medium">For Business</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Partner with <span className="text-[#F4D35E]">CircuCity</span>
                            </h2>
                            <p className="text-gray-300 text-lg mb-10 max-w-lg leading-relaxed">
                                Join our marketplace of eco-conscious sellers. Reach customers who care about the planet and grow your sustainable business.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <Users className="w-6 h-6 text-[#F4D35E] mb-3" />
                                    <div className="text-2xl font-bold text-white">28+</div>
                                    <p className="text-sm text-gray-400">Active Sellers</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <TrendingUp className="w-6 h-6 text-[#F4D35E] mb-3" />
                                    <div className="text-2xl font-bold text-white">+45%</div>
                                    <p className="text-sm text-gray-400">Avg. Sales Growth</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <ShieldCheck className="w-6 h-6 text-[#F4D35E] mb-3" />
                                    <div className="text-2xl font-bold text-white">0%</div>
                                    <p className="text-sm text-gray-400">Listing Fees</p>
                                </div>
                            </div>

                            <Link href="/become-seller" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold hover:bg-white transition-all shadow-lg hover:shadow-xl text-lg">
                                Become a Seller <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="lg:w-[45%] relative p-6 md:p-10 flex items-center justify-center">
                            <div className="relative w-full max-w-sm aspect-square">
                                <div className="absolute inset-0 bg-[#F4D35E] rounded-full blur-3xl opacity-20 animate-pulse" />
                                <div className="w-full h-full rounded-full border-[6px] border-white/20 overflow-hidden shadow-2xl">
                                    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" alt="Business owner" className="w-full h-full object-cover" />
                                </div>
                                <motion.div
                                    className="absolute -bottom-4 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <div className="p-2.5 bg-green-100 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900 text-sm">+45% Sales</div>
                                        <div className="text-xs text-gray-500">Partner growth</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
