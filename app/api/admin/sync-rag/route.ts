import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRole } from "@/utils/roles";

const RAG_KEY = process.env.RAG_API_KEY || '';
const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

async function getFullProductCatalog() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true, shop: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return {
    total: products.length,
    updatedAt: new Date().toISOString(),
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      description: p.description?.substring(0, 500) || '',
      category: p.category?.name || '',
      shop: p.shop?.name || '',
      stock: p.inventory,
      weight: p.weight,
      co2Saved: Number(p.co2Saved) || 0,
      image: Array.isArray(p.images) ? (p.images as string[])[0] : null,
      createdAt: p.createdAt.toISOString(),
      ecoLabel: (Number(p.co2Saved) || 0) > 5 ? 'Eco Champion' : (Number(p.co2Saved) || 0) > 1 ? 'Eco Friendly' : '',
    })),
  };
}

export async function GET() {
  try {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    if (!RAG_KEY) {
      return NextResponse.json({ error: 'RAG_API_KEY not configured' }, { status: 500 });
    }

    const catalog = await getFullProductCatalog();

    const promises: any[] = [];

    promises.push(
      fetch(`${RAG_URL}/sync/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': RAG_KEY },
        body: JSON.stringify(catalog),
        signal: AbortSignal.timeout(15000),
      }).catch(() => {})
    );

    promises.push(
      fetch(`${RAG_URL}/sync/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': RAG_KEY },
        body: JSON.stringify({
          documents: [
            {
              id: 'about',
              title: 'About CircuCity',
              content: 'CircuCity is a sustainable e-commerce marketplace connecting eco-conscious consumers with environmentally friendly products. Based in Skellefteå, Sweden, we support sellers who offer recycled, upcycled, organic, and sustainable items. Our platform uses AI to help customers find the right products and track their environmental impact.',
            },
            {
              id: 'shipping',
              title: 'Shipping & Delivery',
              content: 'CircuCity offers shipping through PostNord (2-5 business days) and Shipmondo (5% discount). Free shipping on orders over 2000 SEK. We ship to Sweden, Denmark, Norway, Finland, and Germany. International orders may take 5-10 business days.',
            },
            {
              id: 'returns',
              title: 'Returns & Refunds',
              content: 'Returns are accepted within 14 days of delivery. Items must be in original condition. Contact support@circucity.com to initiate a return. Refunds are processed within 5-10 business days. Eco-friendly packaging is encouraged for all returns.',
            },
            {
              id: 'sustainability',
              title: 'Sustainability Commitment',
              content: 'CircuCity is committed to reducing environmental impact. Every product listing includes CO2 savings data. We promote circular economy through our Swap Market feature. Our servers use renewable energy. We offset shipping emissions through verified carbon projects.',
            },
            {
              id: 'how-to-use',
              title: 'How to Use CircuCity',
              content: 'Browse products by category or use the search bar. Cira, the CircuCity AI assistant, can help you find products, track orders, and answer questions. Create an account to save favorites, track orders, and earn Eco Tokens. Sellers can list products through their dashboard.',
            },
          ],
          updatedAt: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(15000),
      }).catch(() => {})
    );

    await Promise.all(promises);

    return NextResponse.json({
      success: true,
      total: catalog.total,
      documents: 5,
      sample: catalog.products.slice(0, 3),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
