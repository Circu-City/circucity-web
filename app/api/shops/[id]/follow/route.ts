import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getShop(shopId: string) {
  return prisma.shop.findFirst({ where: { id: shopId, status: 'ACTIVE' }, select: { id: true, ownerId: true } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const [count, followed] = await Promise.all([
    prisma.shopFollow.count({ where: { shopId: id } }),
    userId ? prisma.shopFollow.findUnique({ where: { userId_shopId: { userId, shopId: id } }, select: { id: true } }) : null,
  ]);
  return NextResponse.json({ count, followed: !!followed });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in to follow stores' }, { status: 401 });
  const { id } = await params;
  const shop = await getShop(id);
  if (!shop) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  if (shop.ownerId === userId) return NextResponse.json({ error: 'You cannot follow your own store' }, { status: 400 });

  await prisma.shopFollow.upsert({
    where: { userId_shopId: { userId, shopId: id } },
    create: { userId, shopId: id },
    update: {},
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.shopFollow.deleteMany({ where: { userId, shopId: id } });
  return NextResponse.json({ success: true });
}
