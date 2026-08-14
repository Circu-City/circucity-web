import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const DEFAULT_TOPICS = [
  {
    id: 'product_interest',
    title: 'Which product category should we add next?',
    description: 'Vote for the next category we should focus on growing.',
    type: 'product',
    options: ['Home & Garden', 'Kids & Toys', 'Sports & Outdoors', 'Beauty & Personal Care'],
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feature_request',
    title: 'What feature would help you most?',
    description: 'Help us prioritize what to build next.',
    type: 'feature',
    options: ['Price Drop Alerts', 'Subscription Boxes', 'Gift Cards', 'Product Comparison Tool'],
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sustainability',
    title: 'Which cause should we support this quarter?',
    description: 'We donate a portion of every sale to environmental causes. You decide which one.',
    type: 'sustainability',
    options: ['Ocean Cleanup', 'Rainforest Protection', 'Renewable Energy', 'Urban Tree Planting'],
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  try {
    const { userId } = await auth();
    
    const setting = await prisma.platformSettings.findFirst({
      where: { section: 'voting', key: 'topics' },
    });
    
    let topics: any[] = [];
    if (setting?.value) {
      try { topics = JSON.parse(setting.value); } catch {}
    }
    if (topics.length === 0) topics = DEFAULT_TOPICS;
    
    const votesSetting = await prisma.platformSettings.findMany({
      where: { section: 'voting', key: { startsWith: 'votes_' } },
    });
    
    const voteMap: Record<string, Record<string, string>> = {};
    const userVotes: Record<string, string> = {};
    
    for (const vs of votesSetting) {
      const topicId = vs.key.replace('votes_', '');
      try {
        const parsed = JSON.parse(vs.value || '{}');
        voteMap[topicId] = parsed;
        if (userId && parsed[userId]) {
          userVotes[topicId] = parsed[userId];
        }
      } catch {}
    }
    
    const enriched = topics.map((t: any) => {
      const votes = voteMap[t.id] || {};
      const voteCount = Object.keys(votes).length;
      const results: Record<string, number> = {};
      for (const opt of (t.options || [])) {
        results[opt] = Object.values(votes).filter((v: string) => v === opt).length;
      }
      return {
        ...t,
        totalVotes: voteCount,
        results,
        userVote: userVotes[t.id] || null,
      };
    });
    
    return NextResponse.json({ topics: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { topicId, choice } = await request.json();
    if (!topicId || !choice) {
      return NextResponse.json({ error: 'topicId and choice are required' }, { status: 400 });
    }
    
    let votes: Record<string, string> = {};
    const existing = await prisma.platformSettings.findFirst({
      where: { section: 'voting', key: 'votes_' + topicId },
    });
    if (existing?.value) {
      try { votes = JSON.parse(existing.value); } catch {}
    }
    
    if (votes[userId]) {
      return NextResponse.json({ error: 'Already voted', vote: votes[userId] }, { status: 409 });
    }
    
    votes[userId] = choice;
    
    if (existing) {
      await prisma.platformSettings.update({
        where: { id: existing.id },
        data: { value: JSON.stringify(votes) },
      });
    } else {
      await prisma.platformSettings.create({
        data: {
          section: 'voting',
          key: 'votes_' + topicId,
          value: JSON.stringify(votes),
        },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
