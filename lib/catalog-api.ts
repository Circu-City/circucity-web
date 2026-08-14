import prisma from '@/lib/prisma';

const BASE_URL = (process.env.NEXT_PUBLIC_URL || 'https://circucity.com').replace(/\/+$/, '');

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  image: string | null;
  category: string | null;
  stock: number;
  url: string;
  shop: string | null;
};

function mapProduct(p: {
  id: string;
  name: string;
  price: unknown;
  description: string | null;
  images: unknown;
  inventory: number;
  category: { name: string } | null;
  shop: { name: string } | null;
}): CatalogProduct {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    currency: 'SEK',
    description: p.description?.substring(0, 500) || null,
    image: Array.isArray(p.images) ? (p.images as string[])[0] || null : null,
    category: p.category?.name || null,
    stock: p.inventory,
    url: `${BASE_URL}/products/${p.id}`,
    shop: p.shop?.name || null,
  };
}

export async function fetchActiveCatalogProducts(q: string, limit: number) {
  const where = {
    status: 'ACTIVE' as const,
    ...(q.trim()
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: 'desc' },
    include: { category: true, shop: { select: { name: true } } },
  });

  return products.map(mapProduct);
}