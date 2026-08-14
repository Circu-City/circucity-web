import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reward, cost } = await req.json();
    if (!reward || !cost || typeof cost !== 'number' || cost <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoPoints: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentPoints = Number(user.ecoPoints) || 0;
    if (currentPoints < cost) {
      return NextResponse.json({ error: "Insufficient eco tokens" }, { status: 400 });
    }

    const newPoints = Math.max(0, currentPoints - cost);

    await prisma.user.update({
      where: { id: userId },
      data: { ecoPoints: newPoints },
    });

    return NextResponse.json({ success: true, ecoPoints: newPoints, reward });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
