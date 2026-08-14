import { NextRequest, NextResponse } from 'next/server';
import { fetchActiveCatalogProducts } from '@/lib/catalog-api';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 10, 1), 200);
    const products = await fetchActiveCatalogProducts(q, limit);

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        currency: p.currency,
        description: p.description,
        image: p.image,
        category: p.category,
        stock: p.stock,
        url: p.url,
        shop: p.shop ? { name: p.shop } : null,
      })),
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}