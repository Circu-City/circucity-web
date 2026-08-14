import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get recent feedback items (resolved/changed)
    const recentFeedback = await prisma.sellerFeedback.findMany({
      where: { isRead: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get platform changelog from settings
    const changelogSetting = await prisma.platformSettings.findFirst({
      where: { section: "changelog", key: "feedback_loop" },
    });

    let changes: any[] = [];
    if (changelogSetting?.value) {
      try {
        changes = JSON.parse(changelogSetting.value);
      } catch {}
    }

    // Aggregate feedback stats
    const totalFeedback = await prisma.sellerFeedback.count();
    const featureRequests = await prisma.sellerFeedback.count({
      where: { feedbackType: "feature" },
    });
    const problems = await prisma.sellerFeedback.count({
      where: { feedbackType: "problem" },
    });

    return NextResponse.json({
      stats: { totalFeedback, featureRequests, problems },
      recentFeedback: recentFeedback.map((f: any) => ({
        id: f.id,
        type: f.feedbackType,
        comment: f.comment,
        date: f.createdAt,
      })),
      changes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
