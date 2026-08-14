import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    const setting = await prisma.platformSettings.findFirst({
      where: { section: "wrapped_shares", key: token },
    });

    if (!setting?.value) {
      return NextResponse.json({ error: "Wrapped not found" }, { status: 404 });
    }

    const data = JSON.parse(setting.value);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
