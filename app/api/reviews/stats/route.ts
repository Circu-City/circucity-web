import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });
    const avgRating = result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0;
    const totalReviews = result._count.id;
    // Count unique customers who left reviews
    const uniqueCustomers = await prisma.review.groupBy({
      by: ["userId"],
    });
    const totalCustomers = uniqueCustomers.length || totalReviews;
    return NextResponse.json({
      success: true,
      data: {
        avgRating,
        totalReviews,
        totalCustomers,
      },
    });
  } catch (error) {
    // Fallback if reviews table doesn't exist yet
    return NextResponse.json({
      success: true,
      data: { avgRating: 0, totalReviews: 0, totalCustomers: 0 },
    });
  }
}