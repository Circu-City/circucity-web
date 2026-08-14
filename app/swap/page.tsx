import Link from 'next/link';
import { ArrowRight, RefreshCw, Search, Package, User, Leaf, Zap } from 'lucide-react';
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getProductImages } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Swap Market - Trade & Exchange | CircuCity',
  description: 'Trade gently used items with our eco-conscious community. Reduce waste, save money, and find unique treasures.',
};

export default async function SwapMarketPage() {
  const { userId } = await auth();

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', inventory: { gt: 0 } },
    take: 9,
    orderBy: { createdAt: 'desc' },
    include: { category: true, shop: { select: { ownerId: true, name: true } } },
  });

  const swapItems = products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    tokens: Math.round(Number(p.price) * 0.8),
    image: getProductImages(p.images)[0] || null,
    category: p.category?.name || 'General',
    seller: p.shop?.name || 'CircuCity Seller',
    condition: 'Good',
  }));

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2D5F3F] via-[#2D5F3F] to-[#2d5a45] text-white py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D35E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
            <RefreshCw className="w-4 h-4 text-[#F4D35E]" />
            <span className="text-[#F4D35E] font-medium">Circular Economy</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Swap & <span className="text-[#F4D35E]">Trade</span> Sustainably
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Exchange pre-loved items using EcoTokens. Safe escrow — tokens held until both parties confirm delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {userId ? (
              <>
                <Link href="/dashboard/seller/swap" className="px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg hover:shadow-xl">
                  Start Swapping <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/dashboard/orders?tab=swaps" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
                  My Swaps
                </Link>
              </>
            ) : (
              <Link href="/sign-up" className="px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg hover:shadow-xl">
                Join & Start Swapping <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link href="/products" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">How Swap Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Safe escrow-powered swapping in three steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Make an Offer', desc: 'Browse items, propose a swap with EcoTokens. Tokens are held in escrow until completion.', icon: Zap, color: 'bg-[#FDF8E4]', textColor: 'text-[#D4A373]' },
              { step: 2, title: 'Ship & Track', desc: 'Both parties ship their items with tracking. Real-time updates on delivery status.', icon: Package, color: 'bg-[#E7F0E9]', textColor: 'text-[#2D5F3F]' },
              { step: 3, title: 'Inspect & Complete', desc: '72-hour inspection period. Confirm or dispute. Tokens released to seller on completion.', icon: Leaf, color: 'bg-[#E8F8F5]', textColor: 'text-[#1ABC9C]' },
            ].map((item) => (
              <div key={item.step} className="group bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 ${item.textColor}`} />
                </div>
                <div className="w-8 h-8 bg-[#2D5F3F] text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="font-bold text-xl text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Products for Swap */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">Available for Swap</h2>
              <p className="text-gray-500">Live products from our marketplace — make an offer using EcoTokens</p>
            </div>
            <Link href={userId ? '/dashboard/seller/swap' : '/sign-up'} className="text-[#2D5F3F] font-semibold flex items-center gap-2 hover:gap-3 transition-all shrink-0">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {swapItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No products available for swap right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {swapItems.map((item) => (
                <div key={item.id} className="group bg-[#fcf9f2] rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">{item.category}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {item.seller}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> {item.tokens} <span className="text-[#2D5F3F] font-medium">EcoTokens</span> · {item.price} kr
                    </p>
                    <Link
                      href={userId ? `/dashboard/seller/swap` : '/sign-up'}
                      className="mt-4 w-full py-2.5 bg-[#2D5F3F] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1a3a28] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Propose Swap
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Eco Impact */}
      <section className="py-20 bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
            <Leaf className="w-4 h-4 text-[#F4D35E]" />
            <span className="text-[#F4D35E] font-medium">Environmental Impact</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Every Swap Makes a <span className="text-[#F4D35E]">Difference</span></h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-0">
            By trading instead of buying new, you help reduce manufacturing demand, packaging waste, and carbon emissions. Join the circular economy movement today.
          </p>
        </div>
      </section>
    </div>
  );
}
