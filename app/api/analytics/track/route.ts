import { NextRequest, NextResponse } from 'next/server';

const RECENT: { userId: string; page: string; time: number }[] = [];

export async function POST(req: NextRequest) {
  try {
    const { userId, page, action, data } = await req.json();
    if (!page) return NextResponse.json({ ok: true });

    RECENT.push({ userId: userId || 'anon', page, time: Date.now() });
    if (RECENT.length > 5000) RECENT.splice(0, RECENT.length - 5000);

    return NextResponse.json({ ok: true, activityCount: RECENT.length });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const userActivity = userId ? RECENT.filter(a => a.userId === userId).slice(-50) : RECENT.slice(-20);

    const pageCounts: Record<string, number> = {};
    userActivity.forEach(a => { pageCounts[a.page] = (pageCounts[a.page] || 0) + 1; });

    return NextResponse.json({
      recentPages: userActivity.map(a => a.page).filter((v, i, arr) => arr.lastIndexOf(v) === i).slice(-10),
      pageViews: Object.entries(pageCounts).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count),
      totalActivities: userActivity.length,
    });
  } catch {
    return NextResponse.json({ recentPages: [], pageViews: [] });
  }
}
