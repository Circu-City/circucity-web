import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    if (!q.trim() || q.length < 2) return NextResponse.json({ products: [], categories: [] });

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        take: 5,
        select: { id: true, name: true, price: true, images: true, category: { select: { name: true } } },
      }),
      prisma.category.findMany({
        where: { name: { contains: q } },
        take: 3,
        select: { name: true },
      }),
    ]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id, name: p.name, price: Number(p.price),
        image: Array.isArray(p.images) ? (p.images as string[])[0] : null,
        category: p.category?.name,
      })),
      categories: categories.map(c => c.name),
    });
  } catch {
    return NextResponse.json({ products: [], categories: [] });
  }
}
