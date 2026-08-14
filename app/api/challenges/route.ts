import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Load challenges from PlatformSettings
    const setting = await prisma.platformSettings.findFirst({
      where: { section: "community", key: "challenges" },
    });

    let challenges: any[] = [];
    if (setting?.value) {
      try { challenges = JSON.parse(setting.value); } catch {}
    }

    if (challenges.length === 0) {
      challenges = [
        {
          id: "co2_challenge",
          title: "100 Tons CO₂ Challenge",
          description: "Together we can save 100 tons of CO₂. Every eco-friendly purchase counts!",
          icon: "leaf",
          target: 100000, // kg
          current: 0,
          unit: "kg CO₂",
          deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(),
          badge: "Planet Protector",
        },
        {
          id: "orders_challenge",
          title: "10,000 Orders Mission",
          description: "Let's reach 10,000 sustainable orders as a community.",
          icon: "shopping-bag",
          target: 10000,
          current: 0,
          unit: "orders",
          deadline: new Date(new Date().getFullYear(), 8, 30).toISOString(),
          badge: "Community Champion",
        },
        {
          id: "trees_challenge",
          title: "Plant 5,000 Trees",
          description: "Save enough CO₂ to equal planting 5,000 trees.",
          icon: "trees",
          target: 5000,
          current: 0,
          unit: "trees",
          deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(),
          badge: "Forest Guardian",
        },
      ];
    }

    // Compute real progress
    const [totalCo2Agg, totalOrders] = await Promise.all([
      prisma.user.aggregate({ _sum: { totalCo2Saved: true } }),
      prisma.order.count(),
    ]);

    const totalCo2 = Math.round(Number(totalCo2Agg._sum.totalCo2Saved) || 0);
    const treesEquivalent = Math.round(totalCo2 / 0.5);

    // Update challenge progress with real data
    const updatedChallenges = challenges.map((c: any) => {
      if (c.id === "co2_challenge") return { ...c, current: totalCo2 };
      if (c.id === "orders_challenge") return { ...c, current: totalOrders };
      if (c.id === "trees_challenge") return { ...c, current: treesEquivalent };
      return c;
    });

    return NextResponse.json({ challenges: updatedChallenges });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
