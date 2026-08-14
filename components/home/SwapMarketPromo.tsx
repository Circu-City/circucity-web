import Link from 'next/link';
import { ArrowRight, RefreshCw, Package } from 'lucide-react';
import prisma from '@/lib/prisma';

async function getSwapProducts() {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: { category: true },
        });
        return products.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image: Array.isArray((p as any).images) ? ((p as any).images as string[])[0] || null : null,
            category: (p as any).category?.name || 'General',
        }));
    } catch { return []; }
}

export async function SwapMarketPromo() {
    const products = await getSwapProducts();

    return (
        <section className="py-16 px-4 bg-gradient-to-br from-[#2D5F3F] to-[#1a3a28] text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23fff' fill-opacity='0.05'/%3E%3C/svg%3E")` }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4D35E]/20 backdrop-blur-sm rounded-full mb-6">
                        <RefreshCw className="w-5 h-5 text-[#F4D35E]" />
                        <span className="text-sm text-[#F4D35E] font-medium">Swap Market</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Available for Swap</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Trade pre-loved items with the community. Reduce waste, earn EcoTokens, and give items a second life.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {products.map((p) => (
                        <Link key={p.id} href={`/products/${p.id}`} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/20 transition-all group">
                            <div className="h-40 bg-white/5 flex items-center justify-center">
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-12 h-12 text-white/20" />
                                )}
                            </div>
                            <div className="p-3">
                                <p className="font-semibold text-white text-sm line-clamp-1 group-hover:text-[#F4D35E] transition-colors">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{p.category} · {p.price} kr</p>
                            </div>
                        </Link>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-4 text-center py-8 text-gray-400">
                            <p>No products available for swap yet. Check back soon!</p>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/swap" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Explore Swap Market <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
