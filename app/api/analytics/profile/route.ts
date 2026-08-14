import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await auth();
    if (!sessionUserId) return NextResponse.json({ authenticated: false });

    const userId = req.nextUrl.searchParams.get('userId') || '';
    if (!userId || userId !== sessionUserId) return NextResponse.json({ authenticated: false });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, ecoPoints: true, totalCo2Saved: true, role: true },
    });
    if (!user) return NextResponse.json({ authenticated: false });

    const [orders, wishlist, orderCount] = await Promise.all([
      prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, total: true, status: true, createdAt: true } }),
      prisma.wishlist.findUnique({ where: { userId }, select: { items: { include: { product: { select: { name: true, price: true, id: true, category: true } } }, take: 10 } } }),
      prisma.order.count({ where: { userId } }),
    ]);

    const recentOrders = orders.map(o => ({
      id: o.id.substring(0, 12), total: Number(o.total), status: o.status,
      date: o.createdAt.toISOString().substring(0, 10),
    }));

    const favProducts = wishlist?.items?.map(i => ({
      name: i.product.name, price: Number(i.product.price),
      id: i.product.id, category: i.product.category,
    })) || [];

    const activeOrder = orders.find(o => ['PAID', 'SHIPPED'].includes(o.status));

    return NextResponse.json({
      authenticated: true,
      profile: { name: user.name, email: user.email, ecoPoints: user.ecoPoints, totalCo2Saved: Number(user.totalCo2Saved) || 0 },
      orders: recentOrders,
      activeOrder: activeOrder ? { id: activeOrder.id.substring(0, 12), status: activeOrder.status, total: Number(activeOrder.total) } : null,
      favorites: favProducts,
      orderCount,
      wishlistCount: favProducts.length,
      summary: `${user.name || 'Customer'} has ${orderCount} orders, ${favProducts.length} wishlist items, ${user.ecoPoints} eco points, and ${Number(user.totalCo2Saved) || 0}kg CO2 saved.`,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
