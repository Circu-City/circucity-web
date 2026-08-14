import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = crypto.randomBytes(16).toString("hex");

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [user, yearOrders, totalAllTime, recentStreak, topCategory, impact] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, ecoPoints: true, totalCo2Saved: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { userId, createdAt: { gte: yearStart } },
        include: {
          items: {
            include: { product: { select: { name: true, categoryId: true, co2Saved: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.orderItem.findMany({
        where: { order: { userId } },
        include: { product: { select: { categoryId: true, category: { select: { name: true } } } } },
      }),
      prisma.user.aggregate({ _sum: { totalCo2Saved: true } }),
    ]);

    const yearOrderCount = yearOrders.length;
    const yearTotalSpent = yearOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const yearCo2Saved = yearOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + (Number(i.product.co2Saved) * i.quantity), 0), 0
    );
    const yearItemCount = yearOrders.reduce((sum, o) => sum + o.items.length, 0);

    const categoryCount = new Map<string, { name: string; count: number }>();
    for (const item of topCategory) {
      const catName = item.product.category?.name || "Other";
      const existing = categoryCount.get(item.product.categoryId) || { name: catName, count: 0 };
      existing.count += 1;
      categoryCount.set(item.product.categoryId, existing);
    }
    const topCat = Array.from(categoryCount.values()).sort((a, b) => b.count - a.count)[0];

    let currentStreak = 0;
    if (recentStreak.length > 0) {
      const dates = recentStreak.map((o) => {
        const d = new Date(o.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
      const uniqueDays = [...new Set(dates)].sort((a, b) => b - a);
      currentStreak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const diff = (uniqueDays[i - 1] - uniqueDays[i]) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    const leaderboardRank = await prisma.user.count({
      where: { ecoPoints: { gt: user?.ecoPoints || 0 } },
    });

    const allUserCo2 = impact._sum.totalCo2Saved || 0;

    const snapshot = {
      year: now.getFullYear(),
      name: user?.name || "Shopper",
      stats: {
        orders: yearOrderCount,
        totalSpent: Math.round(yearTotalSpent * 100) / 100,
        co2Saved: Math.round(yearCo2Saved * 10) / 10,
        itemsPurchased: yearItemCount,
        treesEquivalent: Math.round(yearCo2Saved / 0.5),
        waterSaved: Math.round(yearCo2Saved * 1.5),
        topCategory: topCat?.name || "Various",
        ecoPoints: user?.ecoPoints || 0,
        currentStreak,
        leaderboardRank: leaderboardRank + 1,
        totalPlatformCo2: Math.round(Number(allUserCo2)),
        totalAllTime,
      },
    };

    const existing = await prisma.platformSettings.findFirst({
      where: { section: "wrapped_shares", key: token },
    });

    if (existing) {
      await prisma.platformSettings.update({
        where: { id: existing.id },
        data: { value: JSON.stringify(snapshot) },
      });
    } else {
      await prisma.platformSettings.create({
        data: { section: "wrapped_shares", key: token, value: JSON.stringify(snapshot) },
      });
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://circucity.com"}/wrapped/share/${token}`;

    return NextResponse.json({ url, token });
  } catch (error: any) {
    console.error("Share wrapped error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
