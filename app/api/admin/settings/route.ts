import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getPlatformSettings } from '@/lib/platform-settings';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await getPlatformSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[admin/settings] GET failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { section, ...data } = body;

    if (!section || typeof section !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing section' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') continue;
      await prisma.platformSettings.upsert({
        where: { section_key: { section, key } },
        update: { value, updatedBy: userId },
        create: { section, key, value, updatedBy: userId },
      });
    }

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('[admin/settings] POST failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
