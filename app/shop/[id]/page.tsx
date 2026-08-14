import prisma from '@/lib/prisma';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Store, Package, Star, Leaf, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { getProductImages } from '@/lib/utils';
import { formatPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({ where: { id }, select: { name: true, description: true } });
  if (!shop) return { title: 'Shop Not Found' };
  return { title: `${shop.name} — CircuCity`, description: shop.description || `Browse products from ${shop.name}` };
}

export default async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: { category: true, reviews: { select: { rating: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { products: true } },
    },
  });

  if (!shop) notFound();

  // Track store view
  try {
    await prisma.productView.create({
      data: { productId: shop.products[0]?.id || 'placeholder', shopId: shop.id },
    });
  } catch { /* view tracking is non-critical */ }

  const totalReviews = shop.products.reduce((s, p) => s + p.reviews.length, 0);
  const avgRating = totalReviews > 0
    ? (shop.products.flatMap(p => p.reviews).reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-[#2D5F3F] to-[#3a7a52] text-white">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
              {shop.logo ? <img src={shop.logo} alt={shop.name} className="w-full h-full rounded-2xl object-cover" /> : shop.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-4 h-4 text-green-200" />
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                {avgRating && (
                  <span className="text-sm text-green-200 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {avgRating}
                  </span>
                )}
              </div>
              {shop.description && <p className="text-green-200 text-sm max-w-2xl">{shop.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-green-200">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {shop._count.products} products</span>
                <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {totalReviews} reviews</span>
                <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> {shop.ecoPoints.toLocaleString()} Eco Points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {shop.products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-500">This seller hasn&apos;t listed any products yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Products ({shop.products.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shop.products.map(product => {
                const image = getProductImages(product.images)[0];
                const avgProdRating = product.reviews.length > 0
                  ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
                  : null;
                return (
                  <Link key={product.id} href={`/products/${product.id}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {image ? (
                        <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-12 h-12" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                        {product.category?.name && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{product.category.name}</span>}
                        {avgProdRating && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{avgProdRating}</span>}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                      <p className="font-bold text-[#2D5F3F]">{formatPrice(Number(product.price))}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
