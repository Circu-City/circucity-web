import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ proposals: [] });

  const data = await prisma.swapProposal.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    include: {
      product: { select: { id: true, name: true, images: true } },
      fromUser: { select: { name: true } },
      toUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    proposals: data.map(p => ({
      id: p.id,
      product: { id: p.product.id, name: p.product.name, image: Array.isArray((p.product as any).images) ? ((p.product as any).images as string[])[0] : null },
      fromUser: p.fromUser?.name || "Unknown",
      toUser: p.toUser?.name || "Unknown",
      amount: p.amount,
      message: p.message,
      trackingInfo: (p as any).trackingInfo || null,
      status: p.status,
      createdAt: p.createdAt,
      incoming: p.toUserId === userId,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, amount, message, toUserId } = await req.json();
    if (!productId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, include: { shop: { select: { ownerId: true } } } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoPoints: true } });
    if (!user || Number(user.ecoPoints) < amount) {
      return NextResponse.json({ error: "Insufficient eco tokens" }, { status: 400 });
    }

    const recipientId = toUserId || product.shop?.ownerId;
    if (!recipientId) {
      return NextResponse.json({ error: "Could not determine product owner" }, { status: 400 });
    }
    if (recipientId === userId) {
      return NextResponse.json({ error: "Cannot send offer to yourself" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { ecoPoints: { decrement: amount } } }),
      prisma.swapProposal.create({
        data: { productId, fromUserId: userId, toUserId: recipientId, amount, message },
      }),
      prisma.notification.create({
        data: {
          userId: recipientId,
          title: "New Swap Offer",
          message: `You received an offer of ${amount} EcoTokens for "${product.name}"`,
          type: "SWAP",
          link: "/dashboard/seller/swap",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status, trackingInfo } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const validStatuses = ["pending", "accepted", "declined", "shipped", "received", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const proposal = await prisma.swapProposal.findUnique({
      where: { id },
      include: { product: { select: { name: true } } },
    });
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Authorization: only the recipient (seller) can accept/decline/ship
    // Only the sender (buyer) can mark as received
    const isSeller = proposal.toUserId === userId;
    const isBuyer = proposal.fromUserId === userId;

    if (status === "accepted" || status === "declined") {
      if (!isSeller) return NextResponse.json({ error: "Only the seller can accept or decline" }, { status: 403 });
    }
    if (status === "shipped") {
      if (!isSeller) return NextResponse.json({ error: "Only the seller can mark as shipped" }, { status: 403 });
    }
    if (status === "received") {
      if (!isBuyer) return NextResponse.json({ error: "Only the buyer can mark as received" }, { status: 403 });
    }

    const updateData: any = { status };
    if (trackingInfo) updateData.trackingInfo = trackingInfo;

    await prisma.swapProposal.update({ where: { id }, data: updateData });

    // Notifications for each status transition
    if (status === "accepted") {
      // Create an Order so the swap appears in the seller's orders page
      const orderId = `swap_order_${proposal.id}`;
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            id: orderId,
            userId: proposal.fromUserId,
            total: 0,
            status: "PAID",
            stripeChargeId: "swap_" + proposal.id,
            items: {
              create: {
                productId: proposal.productId,
                quantity: 1,
                price: 0,
              },
            },
          },
        });

        await tx.notification.create({
          data: {
            userId: proposal.fromUserId,
            title: "Swap Offer Accepted!",
            message: `Your offer of ${proposal.amount} EcoTokens for "${proposal.product.name}" was accepted! Pay for shipping in your orders.`,
            type: "SWAP",
            link: "/dashboard/orders/" + orderId,
          },
        });

        await tx.notification.create({
          data: {
            userId: proposal.toUserId,
            title: "Swap Accepted — Create Shipment",
            message: `You accepted the offer for "${proposal.product.name}". Create a shipment from the order page.`,
            type: "SUCCESS",
            link: "/dashboard/seller/orders/" + orderId,
          },
        });
      });
    }

    if (status === "shipped") {
      await prisma.notification.create({
        data: {
          userId: proposal.fromUserId,
          title: "Item Shipped!",
          message: `"${proposal.product.name}" has been shipped by the seller${trackingInfo ? `. Tracking: ${trackingInfo}` : ""}. Mark it as received when it arrives.`,
          type: "SUCCESS",
          link: "/swap",
        },
      });
    }

    if (status === "received") {
      // Transfer eco tokens to seller
      await prisma.$transaction([
        prisma.user.update({
          where: { id: proposal.toUserId },
          data: { ecoPoints: { increment: proposal.amount } },
        }),
        prisma.swapProposal.update({
          where: { id },
          data: { status: "completed", completedAt: new Date() },
        }),
      ]);
      await prisma.notification.create({
        data: {
          userId: proposal.toUserId,
          title: "Swap Completed!",
          message: `"${proposal.product.name}" was marked as received. You earned ${proposal.amount} EcoTokens!`,
          type: "SUCCESS",
          link: "/dashboard/seller/swap",
        },
      });
      await prisma.notification.create({
        data: {
          userId: proposal.fromUserId,
          title: "Swap Completed!",
          message: `Your swap for "${proposal.product.name}" is complete. Thanks for participating in the circular economy!`,
          type: "SUCCESS",
          link: "/swap",
        },
      });
      return NextResponse.json({ success: true, completed: true });
    }

    if (status === "declined") {
      // Refund eco tokens to buyer
      await prisma.user.update({
        where: { id: proposal.fromUserId },
        data: { ecoPoints: { increment: proposal.amount } },
      });
      await prisma.notification.create({
        data: {
          userId: proposal.fromUserId,
          title: "Swap Offer Declined",
          message: `Your offer for "${proposal.product.name}" was declined. Your ${proposal.amount} EcoTokens have been refunded.`,
          type: "SWAP",
          link: "/swap",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
