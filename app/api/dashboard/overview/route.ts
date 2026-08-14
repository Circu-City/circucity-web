import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user, orders, reviewCount, firstOrder, wishlistCount, shopCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, ecoPoints: true, totalCo2Saved: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { userId },
        select: { total: true, status: true },
      }),
      prisma.review.count({ where: { userId } }),
      prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.wishlist.count({ where: { userId } }),
      prisma.product.count({ where: { shop: { ownerId: userId } } }),
    ]);

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingOrders = orders.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status)).length;
    const dbPoints = Number(user?.ecoPoints || 0);
    const ecoPoints = dbPoints > 0 ? dbPoints : Math.round(totalSpent * 10);

    return NextResponse.json({
      stats: { totalOrders, totalSpent, pendingOrders, ecoPoints, totalCo2Saved: Number(user?.totalCo2Saved || 0) },
      user: { name: user?.name, email: user?.email, ecoPoints, createdAt: user?.createdAt },
      reviewCount,
      wishlistCount,
      productsCount: shopCount,
      firstOrderDate: firstOrder?.createdAt || null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
