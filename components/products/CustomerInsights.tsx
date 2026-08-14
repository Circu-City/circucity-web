import { Leaf, TrendingUp, Users, ShoppingBag, MessageCircle } from "lucide-react";

interface InsightsProps {
  productId: string;
  categoryId: string;
  shopId: string;
}

async function getInsights(productId: string, categoryId: string, shopId: string) {
  const { default: prisma } = await import("@/lib/prisma");

  const [
    totalViews,
    categoryViews,
    shopProducts,
    reviewAgg,
    orderItemCount,
  ] = await Promise.all([
    prisma.productView.count({ where: { productId } }),
    prisma.productView.count({ where: { product: { categoryId } } }),
    prisma.product.findMany({
      where: { shopId, id: { not: productId }, status: "ACTIVE" },
      select: { id: true, name: true, price: true, co2Saved: true },
      take: 4,
    }),
    prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.orderItem.count({
      where: { productId },
    }),
  ]);

  const avgRating = reviewAgg._avg.rating ? Number(reviewAgg._avg.rating).toFixed(1) : null;

  return {
    totalViews,
    categoryViews,
    avgRating,
    reviewCount: reviewAgg._count,
    orderCount: orderItemCount,
    similarProducts: shopProducts.map((p: any) => ({
      ...p,
      price: Number(p.price),
    })),
  };
}

export async function CustomerInsights({ productId, categoryId, shopId }: InsightsProps) {
  const insights = await getInsights(productId, categoryId, shopId);

  if (!insights.totalViews && !insights.orderCount) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#2D5F3F]" /> Customer Insights
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {insights.totalViews > 0 && (
          <div className="bg-blue-50 rounded-xl p-3">
            <Users className="w-4 h-4 text-blue-600 mb-1" />
            <p className="text-lg font-bold text-blue-700">{insights.totalViews}</p>
            <p className="text-[10px] text-blue-600 font-medium">Product Views</p>
          </div>
        )}
        {insights.orderCount > 0 && (
          <div className="bg-emerald-50 rounded-xl p-3">
            <ShoppingBag className="w-4 h-4 text-emerald-600 mb-1" />
            <p className="text-lg font-bold text-emerald-700">{insights.orderCount}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Purchases</p>
          </div>
        )}
        {insights.avgRating && (
          <div className="bg-yellow-50 rounded-xl p-3">
            <MessageCircle className="w-4 h-4 text-yellow-600 mb-1" />
            <p className="text-lg font-bold text-yellow-700">{insights.avgRating}</p>
            <p className="text-[10px] text-yellow-600 font-medium">Avg Rating ({insights.reviewCount})</p>
          </div>
        )}
        {insights.categoryViews > 0 && (
          <div className="bg-purple-50 rounded-xl p-3">
            <Leaf className="w-4 h-4 text-purple-600 mb-1" />
            <p className="text-lg font-bold text-purple-700">{insights.categoryViews}</p>
            <p className="text-[10px] text-purple-600 font-medium">Category Views</p>
          </div>
        )}
      </div>

      {insights.similarProducts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From this seller</p>
          <div className="space-y-2">
            {insights.similarProducts.map((p: any) => (
              <a
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{p.name}</span>
                <span className="text-sm font-medium text-[#2D5F3F]">{Number(p.price).toFixed(0)} kr</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
