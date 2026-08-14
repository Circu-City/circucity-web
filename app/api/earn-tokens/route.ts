import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    if (action === 'login') {
      const today = new Date().toISOString().substring(0, 10);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoPoints: true, lastLoginDate: true } });

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toISOString().substring(0, 10) : null;
      if (lastLogin === today) {
        return NextResponse.json({ success: true, ecoPoints: Number(user.ecoPoints), bonusAwarded: false });
      }

      const bonus = 10;
      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: bonus }, lastLoginDate: new Date() },
      });

      return NextResponse.json({
        success: true,
        ecoPoints: Number(user.ecoPoints) + bonus,
        bonusAwarded: true,
        bonus,
        message: `+${bonus} tokens for daily login!`,
      });
    }

    if (action === 'review') {
      const bonus = 50;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoPoints: true } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: bonus } },
      });

      return NextResponse.json({
        success: true,
        ecoPoints: Number(user.ecoPoints) + bonus,
        bonusAwarded: true,
        bonus,
        message: `+${bonus} tokens for writing a review!`,
      });
    }

    if (action === 'share') {
      const bonus = 25;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoPoints: true } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: bonus } },
      });

      return NextResponse.json({
        success: true,
        ecoPoints: Number(user.ecoPoints) + bonus,
        bonusAwarded: true,
        bonus,
        message: `+${bonus} tokens for sharing!`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
