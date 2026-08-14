import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { classifyTypeFromText } from '@/lib/complementary-pairings';

export async function POST(req: NextRequest) {
  try {
    let userId = req.headers.get('x-user-id');

    if (!userId) {
      try {
        const { auth } = await import('@clerk/nextjs/server');
        const session = await auth();
        userId = session?.userId || null;
      } catch {
        const cookie = req.cookies.get('__session')?.value;
        if (cookie) {
          try {
            const parts = cookie.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
              userId = payload?.sub || payload?.user_id || null;
            }
          } catch {}
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      name,
      description,
      price,
      inventory,
      category: categoryName,
      imageUrl,
      co2Saved,
      weight,
      condition,
      attributes,
      aiRawResponse,
      aiSuggestedPriceSek,
    } = body;
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: `seller-${userId}@circucity.com`, name: 'Seller', role: 'SELLER' },
      update: {},
    });

    let shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) {
      shop = await prisma.shop.create({
        data: { ownerId: userId, name: 'My Shop', status: 'ACTIVE' },
      });
    }

    const resolvedCategoryName = categoryName || 'General';
    const productDescription = description || name;
    const aiAttributes: Record<string, string> = attributes && typeof attributes === 'object' ? attributes : {};
    const type =
      aiAttributes.type || aiAttributes.Type || classifyTypeFromText(name, productDescription, resolvedCategoryName);

    await prisma.product.create({
      data: {
        name,
        description: productDescription,
        price: parseFloat(price) || 0,
        inventory: parseInt(inventory) || 1,
        status: 'ACTIVE',
        co2Saved: parseFloat(co2Saved) || 0,
        weight: weight ? parseFloat(weight) : null,
        condition: condition || 'NEW',
        images: imageUrl ? [imageUrl] : [],
        shop: { connect: { id: shop.id } },
        category: { connectOrCreate: { where: { name: resolvedCategoryName }, create: { name: resolvedCategoryName } } },
        attributes: { ...aiAttributes, type },
        aiRawResponse: aiRawResponse ?? undefined,
        aiSuggestedPriceSek: aiSuggestedPriceSek ? parseInt(aiSuggestedPriceSek) : undefined,
        aiAnalyzedAt: aiRawResponse ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: String(e?.message || e) }, { status: 500 });
  }
}
