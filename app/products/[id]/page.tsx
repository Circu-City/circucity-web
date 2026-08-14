
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Leaf, ShieldCheck, Truck, RotateCcw, ChevronRight, Store } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddToCart } from "@/components/products/AddToCart";
import { ProductDetailsTabs } from "@/components/products/ProductDetailsTabs";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CompleteTheLook } from "@/components/products/CompleteTheLook";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { formatPrice } from "@/lib/pricing";
import { getProductImages } from "@/lib/utils";
import { getComplementaryProducts } from "@/lib/complementary-pairings";

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
            category: true,
            shop: true,
        },
    });

    if (!product) {
        notFound();
    }

    const mainImage = getProductImages(product.images)[0] || '/placeholder.png'; // Assuming images array

    // Fetch related products (same category, different ID)
    const relatedProductsRaw = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            status: 'ACTIVE',
        },
        take: 4,
        include: {
            category: true,
        },
    });

    // Serialize related products (convert Decimal to number for Client Components)
    const relatedProducts = relatedProductsRaw.map(p => ({
        ...p,
        price: Number(p.price),
        co2Saved: p.co2Saved ? Number(p.co2Saved) : null,
        weight: p.weight ? Number(p.weight) : null
    }));

    // Fetch complementary products ("Complete the Look") — additive to, never a
    // replacement for, the same-category "You May Also Like" results above.
    const productAttributes = (product.attributes as Record<string, unknown> | null) || null;
    const complementaryRaw = await getComplementaryProducts({
        productId: product.id,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        type: (productAttributes?.type as any) ?? null,
        limit: 4,
    });
    const complementaryProducts = complementaryRaw.map(p => ({
        ...p,
        price: Number(p.price),
        co2Saved: p.co2Saved ? Number(p.co2Saved) : null,
        weight: p.weight ? Number(p.weight) : null
    }));

    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            <ViewTracker productId={product.id} />
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex items-center text-sm text-gray-500 space-x-2">
                    <Link href="/" className="hover:text-[#2D5F3F] transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/products" className="hover:text-[#2D5F3F] transition-colors">Products</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="hover:text-[#2D5F3F] transition-colors">{product.category.name}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left Column: Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-cover object-center"
                                priority
                            />
                            {/* Tags overlaid on image if desired, or kept clean */}
                        </div>
                        {/* Optional thumbnail gallery if multiple images */}
                    </div>

                    {/* Right Column: Details */}
                    <div>
                        {/* Badges */}
                        <div className="flex gap-2 mb-4">
                            <Badge className="bg-[#2D5F3F] hover:bg-[#152a22] text-white px-3 py-1 text-sm font-normal rounded-full">
                                <Leaf className="w-3 h-3 mr-1.5 inline-block" />
                                Eco-Conscious Certified
                            </Badge>
                            {/* Dynamic Condition Badge */}
                            {(product as any).condition && (product as any).condition !== 'NEW' && (
                                <Badge variant="outline" className="text-gray-600 border-gray-300">
                                    {(product as any).condition.replace('_', ' ')}
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-serif">
                            {product.name}
                        </h1>

                        {/* Reviews (Placeholder) */}
                        <div className="flex items-center mb-6 space-x-2">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">4.8 (124 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="text-3xl font-bold text-[#2D5F3F] mb-2">
                            {formatPrice(Number(product.price))}
                        </div>

                        {/* Shop */}
                        {product.shop && (
                          <Link href={`/shop/${product.shop.id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#2D5F3F] mb-4">
                            <Store className="w-4 h-4" /> Sold by <span className="font-medium underline">{product.shop.name}</span>
                          </Link>
                        )}

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed mb-8">
                            {product.description}
                        </p>


                        {/* CO2 Impact Box */}
                        {/* Only show if co2Saved > 0 */}
                        {product.co2Saved > 0 && (
                            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 mb-8 flex items-center gap-4">
                                <div className="bg-[#22c55e] rounded-full p-3 text-white">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">CO₂ Saved per Product</div>
                                    <div className="text-2xl font-bold text-[#2D5F3F]">{product.co2Saved} kg</div>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-gray-200 my-8"></div>

                        {/* Quantity & Add to Cart */}
                        {product.inventory > 0 ? (
                            <AddToCart
                                productId={product.id}
                                price={Number(product.price)}
                                productName={product.name}
                                image={mainImage}
                            />
                        ) : (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl font-medium text-center">
                                Out of Stock
                            </div>
                        )}

                        {/* Feature Icons */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <ShieldCheck className="w-6 h-6 text-[#2D5F3F] mb-2" />
                                <span className="text-xs font-medium text-gray-600">Certified Organic</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <Truck className="w-6 h-6 text-[#2D5F3F] mb-2" />
                                <span className="text-xs font-medium text-gray-600">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <RotateCcw className="w-6 h-6 text-[#2D5F3F] mb-2" />
                                <span className="text-xs font-medium text-gray-600">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tabs/Details */}
                <ProductDetailsTabs
                    productId={product.id}
                    description={product.description || ''}
                />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif">You May Also Like</h2>
                        <ProductGrid products={relatedProducts} />
                    </div>
                )}

                {/* Complementary Products */}
                <CompleteTheLook categoryName={product.category.name} products={complementaryProducts} />
            </main>
        </div>
    );
}
