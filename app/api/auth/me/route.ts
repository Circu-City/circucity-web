import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser().catch(() => null);

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, ecoPoints: true, totalCo2Saved: true, createdAt: true, role: true, billingName: true, billingAddress: true, billingCity: true, billingCountry: true, businessType: true, vatNumber: true, vatValidated: true },
    });

    const name = dbUser?.name || clerkUser?.firstName
      ? `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim()
      : dbUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    const email = dbUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber || '';
    const image = clerkUser?.imageUrl || dbUser?.image || '';

    return NextResponse.json({
      id: userId,
      name,
      email,
      phone,
      image,
      ecoPoints: Number(dbUser?.ecoPoints || 0),
      totalCo2Saved: Number(dbUser?.totalCo2Saved || 0),
      createdAt: dbUser?.createdAt || clerkUser?.createdAt,
      role: dbUser?.role,
      billingName: dbUser?.billingName,
      billingAddress: dbUser?.billingAddress,
      billingCity: dbUser?.billingCity,
      billingCountry: dbUser?.billingCountry,
      businessType: dbUser?.businessType,
      vatNumber: dbUser?.vatNumber,
      vatValidated: dbUser?.vatValidated,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
