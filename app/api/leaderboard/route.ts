import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'users';
        const metric = searchParams.get('metric') || 'ecoPoints';
        const timeframe = searchParams.get('timeframe') || 'all';

        if (metric !== 'ecoPoints' && metric !== 'totalCo2Saved') {
            return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
        }

        const dateFilter: Record<string, Date> = {};
        const now = new Date();
        if (timeframe === 'weekly') {
            dateFilter.gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeframe === 'monthly') {
            dateFilter.gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const orderBy = { [metric]: 'desc' as const };

        if (type === 'users') {
            const users = await prisma.user.findMany({
                where: timeframe !== 'all' ? { createdAt: dateFilter } : {},
                orderBy,
                take: 100,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    ecoPoints: true,
                    totalCo2Saved: true,
                },
            });

            const serialized = users.map((u) => ({
                ...u,
                ecoPoints: Number(u.ecoPoints) || 0,
                totalCo2Saved: Number(u.totalCo2Saved) || 0,
            }));

            return NextResponse.json(serialized);
        }

        if (type === 'companies') {
            const companies = await prisma.shop.findMany({
                where: timeframe !== 'all' ? { createdAt: dateFilter } : {},
                orderBy,
                take: 100,
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    ecoPoints: true,
                    totalCo2Saved: true,
                },
            });

            const serialized = companies.map((c) => ({
                ...c,
                ecoPoints: Number(c.ecoPoints) || 0,
                totalCo2Saved: Number(c.totalCo2Saved) || 0,
            }));

            return NextResponse.json(serialized);
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
