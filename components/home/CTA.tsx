import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-[#2D5F3F] to-[#1a3a28] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-[#F4D35E]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Start Your <span className="text-[#F4D35E]">Sustainable Journey Today</span>
                        </h2>
                        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Join thousands of conscious consumers making a difference with every purchase.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/products" className="px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg w-full sm:w-auto">
                                Browse Products <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
