import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { co2Saved: true, name: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ order: null });
    }

    const totalCo2 = order.items.reduce(
      (sum, item) => sum + (Number(item.product.co2Saved) * item.quantity), 0
    );

    return NextResponse.json({
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          co2Saved: Number(item.product.co2Saved),
          quantity: item.quantity,
          price: item.price,
        })),
        co2Impact: {
          totalCo2Saved: Math.round(totalCo2 * 10) / 10,
          treesEquivalent: Math.round(totalCo2 / 0.5),
          waterSaved: Math.round(totalCo2 * 1.5),
        },
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching latest order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
