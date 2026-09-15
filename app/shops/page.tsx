import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Store, Package, Leaf } from 'lucide-react';
import prisma from '@/lib/prisma';
import { pageAlternates, snippet } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Until this page existed, each of the 24 seller storefronts was linked from
// exactly one place -- a "visit shop" link on its own products' detail pages --
// so a shop with no product a crawler had reached was unreachable itself. This
// is the one index that links all of them, and the footer links here.
export const metadata: Metadata = {
    title: 'All Shops | CircuCity',
    description: 'Browse every independent seller on CircuCity — second-hand, refurbished and sustainable goods from small shops across Sweden.',
    alternates: pageAlternates('/shops'),
};

export default async function ShopsPage() {
    const shops = await prisma.shop.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            ecoPoints: true,
            _count: { select: { products: { where: { status: 'ACTIVE' } } } },
        },
        orderBy: [{ products: { _count: 'desc' } }, { name: 'asc' }],
    });

    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            <div className="bg-[#2D5F3F] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <nav className="flex items-center text-xs sm:text-sm text-gray-300 mb-4 space-x-2">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">Shops</span>
                    </nav>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 font-serif">All Shops</h1>
                    <p className="text-gray-300 text-base sm:text-lg">
                        {shops.length} independent {shops.length === 1 ? 'seller' : 'sellers'} on CircuCity
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {shops.length === 0 ? (
                    <p className="text-gray-500">No shops are open yet. Check back soon.</p>
                ) : (
                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {shops.map((shop) => (
                            <li key={shop.id}>
                                <Link
                                    href={`/shop/${shop.id}`}
                                    className="group flex h-full gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                                >
                                    <div className="w-14 h-14 shrink-0 rounded-xl bg-[#2D5F3F]/10 flex items-center justify-center text-xl font-bold text-[#2D5F3F] overflow-hidden">
                                        {shop.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={shop.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            shop.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-semibold text-gray-900 group-hover:text-[#2D5F3F] flex items-center gap-1.5">
                                            <Store className="w-4 h-4 text-[#2D5F3F] shrink-0" />
                                            <span className="truncate">{shop.name}</span>
                                        </h2>
                                        {shop.description && (
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{snippet(shop.description, 120)}</p>
                                        )}
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{shop._count.products} {shop._count.products === 1 ? 'product' : 'products'}</span>
                                            {shop.ecoPoints > 0 && (
                                                <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-green-600" />{shop.ecoPoints} eco points</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
