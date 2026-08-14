import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const [users, totalCo2, totalEcoPoints] = await Promise.all([
            prisma.user.count(),
            prisma.user.aggregate({ _sum: { totalCo2Saved: true } }),
            prisma.user.aggregate({ _sum: { ecoPoints: true } }),
        ]);

        return NextResponse.json({
            users,
            totalCo2Saved: Math.round(Number(totalCo2._sum.totalCo2Saved) || 0),
            totalEcoPoints: Math.round(Number(totalEcoPoints._sum.ecoPoints) || 0),
        });
    } catch {
        return NextResponse.json({ users: 0, totalCo2Saved: 0, totalEcoPoints: 0 });
    }
}
