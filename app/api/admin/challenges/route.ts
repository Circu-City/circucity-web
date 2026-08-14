import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') return unauthorized();

  const settings = await prisma.platformSettings.findMany({
    where: { section: 'community', key: 'challenges' },
  });

  let challenges: any[] = [];
  if (settings.length > 0) {
    try { challenges = JSON.parse(settings[0].value || '[]'); } catch {}
  }

  // Seed defaults if empty
  if (challenges.length === 0) {
    challenges = [
      {
        id: 'co2_challenge',
        title: '100 Tons CO² Challenge',
        description: 'Together we can save 100 tons of CO². Every eco-friendly purchase counts!',
        icon: 'leaf',
        target: 100000,
        unit: 'kg CO²',
        deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        badge: 'Planet Protector',
      },
      {
        id: 'orders_challenge',
        title: '10,000 Orders Mission',
        description: "Let's reach 10,000 sustainable orders as a community.",
        icon: 'shopping-bag',
        target: 10000,
        unit: 'orders',
        deadline: new Date(new Date().getFullYear(), 8, 30).toISOString(),
        badge: 'Community Champion',
      },
      {
        id: 'trees_challenge',
        title: 'Plant 5,000 Trees',
        description: 'Save enough CO² to equal planting 5,000 trees.',
        icon: 'trees',
        target: 5000,
        unit: 'trees',
        deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        badge: 'Forest Guardian',
      },
    ];
    await prisma.platformSettings.upsert({
      where: { section_key: { section: 'community', key: 'challenges' } },
      update: { value: JSON.stringify(challenges) },
      create: { section: 'community', key: 'challenges', value: JSON.stringify(challenges) },
    }).catch(() => {});
  }

  return NextResponse.json({ challenges });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') return unauthorized();

  const body = await request.json();
  const { action, challenge } = body;

  if (!action || !challenge) {
    return NextResponse.json({ error: 'action and challenge are required' }, { status: 400 });
  }

  let existing = await prisma.platformSettings.findFirst({
    where: { section: 'community', key: 'challenges' },
  });

  let challenges: any[] = [];
  if (existing?.value) {
    try { challenges = JSON.parse(existing.value); } catch {}
  }

  if (action === 'create') {
    if (!challenge.title || !challenge.target) {
      return NextResponse.json({ error: 'Challenge must have a title and target' }, { status: 400 });
    }
    const newChallenge = {
      id: challenge.id || `challenge_${Date.now()}`,
      title: challenge.title,
      description: challenge.description || '',
      icon: challenge.icon || 'target',
      target: Number(challenge.target),
      unit: challenge.unit || '',
      deadline: challenge.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      badge: challenge.badge || '',
      createdAt: new Date().toISOString(),
    };
    challenges.push(newChallenge);
  } else if (action === 'update') {
    const idx = challenges.findIndex((c: any) => c.id === challenge.id);
    if (idx === -1) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    challenges[idx] = { ...challenges[idx], ...challenge };
  } else if (action === 'delete') {
    challenges = challenges.filter((c: any) => c.id !== challenge.id);
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (existing) {
    await prisma.platformSettings.update({
      where: { id: existing.id },
      data: { value: JSON.stringify(challenges) },
    });
  } else {
    await prisma.platformSettings.create({
      data: { section: 'community', key: 'challenges', value: JSON.stringify(challenges) },
    });
  }

  return NextResponse.json({ success: true, challenges });
}
