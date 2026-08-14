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
    where: { section: 'voting', key: 'topics' },
  });

  let topics: any[] = [];
  if (settings.length > 0) {
    try { topics = JSON.parse(settings[0].value || '[]'); } catch {}
  }

  // Seed defaults if empty
  if (topics.length === 0) {
    topics = [
      {
        id: 'feature_priority',
        title: 'What feature should we build next?',
        description: 'Help us prioritize our roadmap by voting on what matters most to you.',
        type: 'product',
        options: [
          { id: 'opt_swaps', label: 'Item Swaps', votes: 0 },
          { id: 'opt_carbon', label: 'Carbon Footprint Tracker', votes: 0 },
          { id: 'opt_local', label: 'Local Pickup Map', votes: 0 },
          { id: 'opt_rewards', label: 'Premium Eco-Rewards Tier', votes: 0 },
        ],
        endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sustainability_focus',
        title: 'Which sustainability initiative should we prioritize?',
        description: 'We want to amplify our impact. Choose the area you’d like us to focus on next.',
        type: 'community',
        options: [
          { id: 'opt_tree', label: 'Tree Planting Partnerships', votes: 0 },
          { id: 'opt_plastic', label: 'Plastic-Free Packaging Incentives', votes: 0 },
          { id: 'opt_edu', label: 'Educational Content Series', votes: 0 },
          { id: 'opt_ship', label: 'Carbon-Neutral Shipping', votes: 0 },
        ],
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    await prisma.platformSettings.upsert({
      where: { section_key: { section: 'voting', key: 'topics' } },
      update: { value: JSON.stringify(topics) },
      create: { section: 'voting', key: 'topics', value: JSON.stringify(topics) },
    }).catch(() => {});
  }

  return NextResponse.json({ topics });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') return unauthorized();

  const body = await request.json();
  const { action, topic } = body;

  if (!action || !topic) {
    return NextResponse.json({ error: 'action and topic are required' }, { status: 400 });
  }

  let existing = await prisma.platformSettings.findFirst({
    where: { section: 'voting', key: 'topics' },
  });

  let topics: any[] = [];
  if (existing?.value) {
    try { topics = JSON.parse(existing.value); } catch {}
  }

  if (action === 'create') {
    if (!topic.title || !topic.options || !Array.isArray(topic.options) || topic.options.length < 2) {
      return NextResponse.json({ error: 'Topic must have a title and at least 2 options' }, { status: 400 });
    }
    const newTopic = {
      id: topic.id || `topic_${Date.now()}`,
      title: topic.title,
      description: topic.description || '',
      type: topic.type || 'other',
      options: topic.options,
      endsAt: topic.endsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    topics.push(newTopic);
  } else if (action === 'update') {
    const idx = topics.findIndex((t: any) => t.id === topic.id);
    if (idx === -1) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    topics[idx] = { ...topics[idx], ...topic };
  } else if (action === 'delete') {
    topics = topics.filter((t: any) => t.id !== topic.id);
    await prisma.platformSettings.deleteMany({
      where: { section: 'voting', key: 'votes_' + topic.id },
    });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (existing) {
    await prisma.platformSettings.update({
      where: { id: existing.id },
      data: { value: JSON.stringify(topics) },
    });
  } else {
    await prisma.platformSettings.create({
      data: {
        section: 'voting',
        key: 'topics',
        value: JSON.stringify(topics),
      },
    });
  }

  return NextResponse.json({ success: true, topics });
}
