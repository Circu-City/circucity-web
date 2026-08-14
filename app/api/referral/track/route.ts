import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ref } = body;

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!ref || ref === userId) return NextResponse.json({ success: false, reason: "invalid_ref" });

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referredBy: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, reason: "user_not_found" });
    }

    if (existing.referredBy) {
      return NextResponse.json({ success: false, reason: "already_referred" });
    }

    const referrer = await prisma.user.findUnique({
      where: { id: ref },
      select: { id: true },
    });

    if (!referrer) {
      return NextResponse.json({ success: false, reason: "referrer_not_found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { referredBy: ref },
    });

    console.log(`Referral tracked: ${userId} referred by ${ref}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
