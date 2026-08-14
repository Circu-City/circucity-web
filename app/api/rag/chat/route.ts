import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const RAG_KEY = process.env.RAG_API_KEY || '';
const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';
const APP_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, '') || 'https://circucity.com';

// ─── Product Cache (TTL 5 min, auto-refresh) ──────────────────────────
let productCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;
let cacheLoading = false;

async function loadProductCache() {
  if (cacheLoading) return;
  cacheLoading = true;
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    productCache = products.map(p => ({
      id: p.id, name: p.name, price: Number(p.price),
      description: p.description?.substring(0, 200) || '',
      category: p.category?.name || '', stock: p.inventory,
      weight: p.weight, co2Saved: Number(p.co2Saved) || 0,
      image: Array.isArray(p.images) ? (p.images as string[])[0] : null,
    }));
    cacheTimestamp = Date.now();
  } catch {}
  cacheLoading = false;
}

async function getCachedProducts(): Promise<any[]> {
  if (productCache && Date.now() - cacheTimestamp < CACHE_TTL) return productCache;
  await loadProductCache();
  return productCache || [];
}

function searchCache(query: string, keywords: string, limit = 5): any[] {
  const all = productCache || [];
  const lower = query.toLowerCase();
  const terms = keywords.split(/\s+/).filter(w => w.length > 2);

  const scored = all.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const desc = p.description.toLowerCase();

    if (name === lower || name.includes(lower)) score += 10;
    if (cat.includes(lower)) score += 5;
    if (desc.includes(lower)) score += 3;
    for (const term of terms) {
      if (name.includes(term)) score += 4;
      if (cat.includes(term)) score += 2;
      if (desc.includes(term)) score += 1;
    }
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(p => p.score > 0).slice(0, limit).map(({ score, ...p }) => p);
}

// ═══ Initialize cache on first load ═══
loadProductCache().catch(() => {});

// ═══ Periodically refresh cache every 5 minutes ═══
setInterval(() => loadProductCache().catch(() => {}), CACHE_TTL).unref();

// ─── Guided Shopping State ───────────────────────────────────────────
const shoppingSessions = new Map<string, { step: number; category: string; filters: Record<string, string>; lastProducts: any[] }>();

type CategoryGuide = { keywords: string[]; questions: string[]; filters: string[] };
const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  dress: {
    keywords: ['dress', 'dresses', 'gown', 'frock', 'outfit'],
    questions: [
      "Ooh, great choice! 😊 What kind of event are you shopping for — casual day out, a party, or something formal?",
      "What's your preferred size? And do you have a color or style in mind? 🎨",
    ],
    filters: ['eventType', 'sizeAndStyle'],
  },
  shoes: {
    keywords: ['shoe', 'shoes', 'sneaker', 'boot', 'boots', 'heel', 'heels', 'sandal', 'loafer', 'footwear'],
    questions: [
      "Nice! 👟 What type of shoes are you after — casual sneakers, formal shoes, boots, or comfy everyday wear?",
      "Got a size and color preference? Also, any brand you're into?",
    ],
    filters: ['shoeType', 'sizeColorBrand'],
  },
  laptop: {
    keywords: ['laptop', 'computer', 'notebook', 'macbook', 'pc', 'desktop', 'chromebook'],
    questions: [
      "Let me help you find the right machine! 💻 What'll you mainly use it for — work, gaming, studies, or general browsing?",
      "Any preference on brand (Apple, Dell, Lenovo?) and budget range?",
    ],
    filters: ['usage', 'brandBudget'],
  },
  phone: {
    keywords: ['phone', 'iphone', 'android', 'smartphone', 'mobile', 'samsung', 'google pixel'],
    questions: [
      "Let's find your perfect phone! 📱 Do you prefer iPhone or Android? And what's most important — camera, battery, or performance?",
      "What's your budget range? Any must-have features?",
    ],
    filters: ['osPreference', 'budgetFeatures'],
  },
  furniture: {
    keywords: ['sofa', 'couch', 'table', 'chair', 'desk', 'bed', 'furniture', 'shelf', 'cabinet', 'wardrobe'],
    questions: [
      "I'd love to help you find the right piece! 🛋️ What room is it for, and what style are you going for — modern, classic, minimalist?",
      "What dimensions or size are you working with? And any preferred material or color?",
    ],
    filters: ['roomStyle', 'sizeMaterial'],
  },
  skincare: {
    keywords: ['skincare', 'skin', 'cream', 'serum', 'moisturizer', 'cleanser', 'face', 'beauty', 'toner', 'sunscreen'],
    questions: [
      "Let's get your skin glowing! ✨ What's your skin type — oily, dry, combination, or sensitive?",
      "Any specific concerns you're addressing — anti-aging, acne, hydration, brightening?",
    ],
    filters: ['skinType', 'concerns'],
  },
  food: {
    keywords: ['food', 'organic', 'snack', 'coffee', 'tea', 'chocolate', 'grocery', 'pantry', 'fresh', 'produce'],
    questions: [
      "Yum! 🍽️ What kind of food are you looking for — snacks, pantry staples, fresh produce, or beverages?",
      "Any dietary preferences? Organic, vegan, gluten-free, or just the good stuff?",
    ],
    filters: ['foodType', 'dietary'],
  },
  gift: {
    keywords: ['gift', 'present', 'birthday', 'christmas', 'valentine', 'anniversary', 'holiday'],
    questions: [
      "Aw, gift shopping! 🎁 Who's it for and what's the occasion?",
      "What's your budget and what kind of things do they like — practical, luxurious, eco-friendly?",
    ],
    filters: ['recipient', 'budgetTaste'],
  },
};

function detectCategoryGuide(message: string): { guide: CategoryGuide; name: string } | null {
  const lower = message.toLowerCase();
  for (const [name, guide] of Object.entries(CATEGORY_GUIDES)) {
    if (guide.keywords.some(kw => lower.includes(kw))) {
      return { guide, name };
    }
  }
  return null;
}

async function getUserContext(userId: string, cookie: string | null) {
  try {
    const res = await fetch(`${APP_URL}/api/analytics/profile`, {
      headers: cookie ? { cookie } : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.authenticated ? data : null;
  } catch { return null; }
}

function extractKeywords(message: string): string {
  return message.toLowerCase()
    .replace(/\b(find|search|show me|recommend|looking for|do you have|can you|please|i want|i need|i'm|im|tell me about|what|which|any|some|a|the|for|is|are|in|on|to|of|with|and|or|that|it|my|your|there)\b/gi, '')
    .replace(/[?.,!]/g, '').trim();
}

async function searchProducts(query: string, keywords: string, limit = 5) {
  try {
    const cached = searchCache(query, keywords, limit);
    if (cached.length > 0) return cached;

    const result = await getCachedProducts();
    if (result.length > 0) return result.slice(0, limit);

    return [];
  } catch { return []; }
}

async function getPopularProducts(limit = 5) {
  const products = await getCachedProducts();
  if (products.length === 0) return [];
  return products.slice(0, limit).map((p: any) => ({
    id: p.id, name: p.name, price: p.price,
    category: p.category, stock: p.stock,
  }));
}

async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
  });
  return orders.map(o => ({
    id: o.id.substring(0, 12), status: o.status, total: Number(o.total),
    date: o.createdAt.toISOString().substring(0, 10),
    items: o.items.map(i => ({ name: i.product.name, quantity: i.quantity, price: Number(i.price) })),
  }));
}

function productToList(p: any) {
  return { id: p.id, name: p.name, price: p.price, image: p.image, category: p.category, stock: p.stock };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, session_id, page_context, cart } = body;
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const authResult = await auth().catch(() => null);
    const userId = authResult?.userId || null;
    const userContext = userId ? await getUserContext(userId, request.headers.get('cookie')) : null;
    const lower = message.trim().toLowerCase();

    // ─── Intent Detection ─────────────────────────────────────────────
    const isInfoIntent = /\b(how (does|do|is|are|can)|what is|who are|tell me about (circucity|the platform|this website)|return policy|shipping policy|delivery|refund|privacy|terms|about you|how you work|how to|explain)\b/i.test(lower);
    const isOrderTrack = /(track|status|where is|locate).*(order|package|delivery|shipment)|(order|package).*(track|status|update|info)/i.test(lower);
    const isPopular = /\b(popular|best.?seller|trending|top.*product|what.?s hot|most.*(bought|viewed|sold|liked|rated))\b/i.test(lower);
    const isShipping = /\b(shipping|delivery|ship|how long|how fast|free shipping|delivery time|shipping cost)\b/i.test(lower);
    const isProductIntent = /find|search|show me|recommend|looking for|i (want|need|am looking|would like|d like)|suggest|product|item|buy|purchase|sell|available|cheap|premium|sustainable|eco|browse|gift/i.test(lower) && !isInfoIntent;

    // ─── Guided Shopping Flow ──────────────────────────────────────────
    const sid = session_id || 'default';
    const shopState = shoppingSessions.get(sid);
    const categoryMatch = detectCategoryGuide(message);

    // NEW SESSION: User asks about a guided category → ask question 1
    if (categoryMatch && !shopState) {
      shoppingSessions.set(sid, { step: 1, category: categoryMatch.name, filters: {}, lastProducts: [] });
      return NextResponse.json({ reply: categoryMatch.guide.questions[0], products: undefined });
    }

    // ACTIVE SESSION: User answered question → ask next or search
    if (shopState && categoryMatch) {
      const guide = CATEGORY_GUIDES[shopState.category];
      shopState.filters[guide?.filters?.[shopState.step - 1] || `filter${shopState.step}`] = message;
      shopState.step++;
      if (guide && shopState.step <= guide.questions.length) {
        shoppingSessions.set(sid, shopState);
        const reply = `${guide.questions[shopState.step - 1]}\n\n${shopState.step > 1 ? "(You can also say \"just show me results\" if you'd rather skip!)" : ""}`;
        return NextResponse.json({ reply, products: undefined });
      }
      // All questions asked → search for products
      const searchTerms = `${shopState.category} ${Object.values(shopState.filters).join(' ')} ${message}`;
      const found = await searchProducts(searchTerms, searchTerms, 5);
      shopState.lastProducts = found;
      shoppingSessions.set(sid, shopState);
      if (found.length > 0) {
        return NextResponse.json({
          reply: `Got it! Based on everything you told me, I found these that I think you'll love 💚\n\n${found.map((p: any) => `**${p.name}** — ${p.price} kr`).join('\n')}`,
          products: found,
        });
      }
      // No exact match → similar products
      const alternatives = await searchProducts(shopState.category, shopState.category, 4);
      return NextResponse.json({
        reply: `Hmm, I couldn't find an *exact* match, but here are some great alternatives I think you'd like! 😊\n\n${alternatives.map((p: any) => `**${p.name}** — ${p.price} kr`).join('\n')}`,
        products: alternatives,
      });
    }

    let products: any[] | undefined;
    let orderData: any[] | undefined;
    let extraContext = '';

    // ─── Handle Intents ───────────────────────────────────────────────
    if (isOrderTrack && userId) {
      orderData = await getUserOrders(userId);
      if (orderData.length > 0) {
        extraContext = `User has ${orderData.length} recent orders: ${JSON.stringify(orderData)}. `;
      } else {
        extraContext = 'User has no orders yet. ';
      }
    } else if (isPopular) {
      products = await getPopularProducts(5);
      extraContext = products.length > 0 ? `Popular products: ${JSON.stringify(products.map(p => productToList(p)))}. ` : '';
    } else if (isShipping) {
      extraContext = 'Shipping info: Free shipping on orders over 2000 kr. PostNord delivery 2-5 business days. Shipmondo available for 5% discount. International shipping to SE, DK, NO, FI, DE. ';
    } else if (isProductIntent && !isInfoIntent) {
      const keywords = extractKeywords(message.trim());
      products = await searchProducts(lower, keywords, 5);
      if (products.length > 0) {
        extraContext = `Available products: ${JSON.stringify(products.map(p => productToList(p)))}. `;
      }
    }

    // ─── Page Context ─────────────────────────────────────────────────
    if (page_context?.productId) {
      try {
        const p = await prisma.product.findUnique({
          where: { id: page_context.productId }, include: { category: true },
        });
        if (p) {
          page_context.productName = p.name;
          page_context.productPrice = Number(p.price);
          page_context.productCategory = p.category?.name;
        }
      } catch {}
    }

    // ─── RAG Call ────────────────────────────────────────────────────
    const payload: any = {
      message: extraContext + message.trim(),
      sessionId: (session_id || `eco-${Date.now()}`).toString().slice(0, 120),
      apiKey: RAG_KEY,
      ecom_api_base_url: APP_URL,
    };
    if (userId) payload.user_id = userId;
    if (userContext) payload.user_context = userContext;
    if (page_context && page_context.url) payload.page_context = page_context;
    if (cart && cart.length > 0) payload.cart = cart;

    let reply = '';
    let ragProducts: any[] | undefined;
    try {
      const res = await fetch(`${RAG_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || data.response || '';
        if (data.products?.length) ragProducts = data.products;
      }
    } catch {}

    if (!products && ragProducts) products = ragProducts;

    // ─── Fallback replies ────────────────────────────────────────────
    if (!reply) {
      if (isOrderTrack && orderData) {
        reply = orderData.length > 0
          ? `Here are your recent orders:\n\n${orderData.map((o: any) => `📦 **Order #${o.id}** — ${o.status} — ${o.total.toLocaleString()} kr — ${o.date}\n${o.items.map((i: any) => `  • ${i.quantity}x ${i.name}`).join('\n')}`).join('\n\n')}\n\nNeed details on a specific order? Let me know which one!`
          : 'I checked your account and you don\'t have any orders yet. Once you place an order, I can help you track it right here!';
      } else if (isShipping) {
        reply = '**📦 Shipping Information**\n\n- **Free shipping** on orders over **2000 kr**\n- **PostNord**: 2-5 business days\n- **Shipmondo**: 5% discount on shipping\n- **International**: We ship to 🇸🇪 Sweden, 🇩🇰 Denmark, 🇳🇴 Norway, 🇫🇮 Finland, 🇩🇪 Germany\n\nWant to know your exact shipping cost? Add items to your cart and I\'ll help you check!';
      } else if (products && products.length > 0) {
        reply = `Here are some products that match:\n\n${products.map((p: any) => `**${p.name}** — ${p.price} kr (${p.category || 'general'})`).join('\n')}`;
      } else {
        reply = 'Let me know how I can help! I can find products, track orders, or answer questions about shipping.';
      }
    }

    // ─── Clean up guided shopping after showing results ────────────────
    if (shopState?.lastProducts?.length) {
      shoppingSessions.delete(sid);
    }

    return NextResponse.json({ reply, products, orders: orderData });
  } catch (e) {
    console.error('RAG proxy error:', String(e));
    return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
  }
}
