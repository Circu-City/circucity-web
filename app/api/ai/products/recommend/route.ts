import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return NextResponse.json(products.map(p => ({
      name: p.name, price: Number(p.price), description: p.description?.substring(0, 200),
      image: Array.isArray(p.images) ? (p.images as string[])[0] : null,
      category: p.category?.name, stock: p.inventory, id: p.id,
      co2Saved: Number(p.co2Saved || 0),
    })));
  } catch { return NextResponse.json([]); }
}
