import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, "") || "https://circucity.com";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 20,
  });

  return NextResponse.json({
    reviews: reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: r.user,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, rating, comment } = await req.json();
    if (!productId || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await prisma.review.findFirst({
      where: { userId, productId },
    });
    if (existing) {
      return NextResponse.json({ error: "You've already reviewed this product" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: { userId, productId, rating: Number(rating), comment: comment.trim() },
      include: { user: { select: { name: true } } },
    });

    let tokenMessage = "";
    try {
      const tokenRes = await fetch(`${APP_URL}/api/earn-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: (req.headers.get("cookie") || "") },
        body: JSON.stringify({ action: "review" }),
      });
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        if (data.bonusAwarded) tokenMessage = `+${data.bonus} tokens for your review!`;
      }
    } catch {}

    return NextResponse.json({ review, tokenMessage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
