import { NextRequest, NextResponse } from 'next/server';
import { fetchActiveCatalogProducts } from '@/lib/catalog-api';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 50, 1), 200);
    const products = await fetchActiveCatalogProducts(q, limit);

    return NextResponse.json({
      source: process.env.NEXT_PUBLIC_URL || 'https://circucity.com',
      syncedAt: new Date().toISOString(),
      total: products.length,
      products,
    });
  } catch (error) {
    console.error('[catalog/live] failed:', error);
    return NextResponse.json(
      { source: null, syncedAt: new Date().toISOString(), total: 0, products: [] },
      { status: 200 },
    );
  }
}