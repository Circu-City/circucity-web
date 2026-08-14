import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const requestSchema = z.object({
  imageDataUrl: z.string().max(8_000_000).optional(),
  titleHint: z.string().trim().max(120).optional().default(''),
}).refine((value) => value.imageDataUrl || value.titleHint, { message: 'Add a product photo or title' });

const analysisSchema = z.object({
  category: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(300),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  suggested_price_sek: z.coerce.number().int().positive().max(1_000_000),
  estimated_age: z.coerce.string().trim().max(80).optional().default('Unknown'),
  estimated_weight_kg: z.coerce.number().positive().max(200).optional().default(0.5),
  // Gemini doesn't reliably return an object here — sometimes it flattens everything
  // into one "Key: value, Key2: value2" string. Normalize before validating rather
  // than trusting the prompt instruction, or a well-formed result gets thrown away.
  attributes: z.preprocess((val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const result: Record<string, string> = {};
      // Split only on commas that start a new "Key:" pair, so multi-value fields
      // like "Features: Reusable, Eco-friendly" stay together under one key.
      val.split(/,\s*(?=[^,:]+:)/).forEach((pair) => {
        const idx = pair.indexOf(':');
        if (idx > -1) {
          const key = pair.slice(0, idx).trim();
          const value = pair.slice(idx + 1).trim();
          if (key) result[key] = value;
        }
      });
      return result;
    }
    return {};
  }, z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))]),
  )).optional().default({}),
  // True only when the price/description were checked against real search results
  // (currently only the Gemini + Google Search tier can set this).
  grounded: z.boolean().optional().default(false),
});
type Analysis = z.infer<typeof analysisSchema>;

const categoryMedians: Record<string, number> = {
  electronics: 1200,
  smartphones: 1800,
  clothing: 350,
  fashion: 350,
  furniture: 900,
  books: 80,
  home: 300,
  skincare: 180,
  sports: 450,
  general: 250,
};

const categoryWeightsKg: Record<string, number> = {
  electronics: 1.5,
  smartphones: 0.2,
  clothing: 0.4,
  fashion: 0.4,
  furniture: 8,
  books: 0.3,
  home: 1,
  skincare: 0.2,
  sports: 1,
  general: 0.5,
};

const conditionMultipliers = { new: 1, like_new: 0.85, good: 0.65, fair: 0.45, poor: 0.25 };

const CATALOGUE_INSTRUCTIONS = 'You catalogue second-hand marketplace products for a Swedish resale platform. Reply with ONLY a JSON object with keys: category, title, description, condition, suggested_price_sek, estimated_age, estimated_weight_kg, attributes, grounded. Condition must be one of new, like_new, good, fair, poor. Title max 80 characters; description max 300 characters. Be honest about visible wear. Never invent a brand, model, material, size, age, authenticity, or functionality that is not clearly visible or confirmed. estimated_weight_kg is the typical shipping weight in kilograms for an item like this (e.g. a t-shirt is about 0.2, a laptop about 1.8, a book about 0.3). estimated_age must be a short string (e.g. "2 years", "Unknown"), not a number. Every value in "attributes" must be a single string — if there are multiple options, join them with a comma instead of using an array. suggested_price_sek must be a realistic SECOND-HAND price in Swedish kronor for the stated condition, not a new-retail price.';

const GEMINI_INSTRUCTIONS = `${CATALOGUE_INSTRUCTIONS} You have a Google Search tool: use it to identify the exact product (brand/model) from the photo and to check real current pricing (new retail and/or comparable second-hand listings) before answering, then base suggested_price_sek on what you found, discounted for condition. Set "grounded" to true only if your search actually found this specific item or a very close match; otherwise set it to false and estimate conservatively.`;

function fallbackAnalysis(titleHint: string): Analysis {
  const title = titleHint.trim() || 'Second-hand item';
  const lower = title.toLowerCase();
  const category = lower.match(/phone|laptop|tablet|camera/) ? 'Electronics'
    : lower.match(/shirt|jacket|dress|shoe|trouser/) ? 'Clothing'
      : lower.match(/chair|table|desk|sofa|lamp/) ? 'Furniture'
        : lower.match(/book|novel/) ? 'Books'
          : 'General';
  return {
    category,
    title: title.slice(0, 80),
    description: `${title} offered second-hand. Review the photo and add any wear, dimensions, or included accessories before publishing.`.slice(0, 300),
    condition: 'good' as const,
    suggested_price_sek: Math.round((categoryMedians[category.toLowerCase()] || categoryMedians.general) * conditionMultipliers.good),
    estimated_age: 'Unknown',
    estimated_weight_kg: categoryWeightsKg[category.toLowerCase()] || categoryWeightsKg.general,
    attributes: {},
    grounded: false,
  };
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return undefined;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return undefined;
    }
  }
}

// Tier 1: Gemini vision + built-in Google Search grounding, in one call. Free-tier
// friendly and gives real online data for price/description ("search lens"). Returns
// null (never throws to the caller) so the route can fall through to the next tier.
async function analyzeWithGemini(imageDataUrl: string, titleHint: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
  const match = imageDataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
  if (!match) return null;
  const [, mimeType, base64Data] = match;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: GEMINI_INSTRUCTIONS }] },
      contents: [{
        role: 'user',
        parts: [
          { text: `Catalogue this item.${titleHint ? ` Seller hint: ${titleHint}` : ''} Search the web to confirm what it is and to find a realistic current second-hand price in SEK.` },
          { inline_data: { mime_type: mimeType, data: base64Data } },
        ],
      }],
      tools: [{ google_search: {} }],
      // thinkingBudget: 0 disables Gemini 2.5's extended-thinking tokens, which
      // otherwise eat into maxOutputTokens and can cut the JSON off mid-way.
      generationConfig: { temperature: 0.2, maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
  const payload = await response.json();
  const text = (payload.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part.text || '')
    .join('');
  if (!text) throw new Error('Gemini returned no content');
  return extractJson(text);
}

// Tier 2: existing free OpenRouter vision model, image-only guess (no live search).
// This is what the app has been relying on solely so far; kept as a fallback so a
// Gemini outage/quota exhaustion doesn't kill AI listings entirely.
async function analyzeWithOpenRouterVision(imageDataUrl: string, titleHint: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 700,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CATALOGUE_INSTRUCTIONS },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Analyse this item for a seller listing.${titleHint ? ` Seller hint: ${titleHint}` : ''}` },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Vision provider returned ${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  return typeof content === 'string' ? JSON.parse(content) : content;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const seller = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, shop: { select: { id: true, status: true } } },
  });
  if (!seller || (seller.role !== 'SELLER' && seller.role !== 'ADMIN') || seller.shop?.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'An active seller shop is required' }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  if (parsed.data.imageDataUrl && !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(parsed.data.imageDataUrl)) {
    return NextResponse.json({ error: 'AI analysis supports JPEG, PNG, and WEBP images' }, { status: 400 });
  }

  let raw: unknown;
  let source: 'gemini' | 'vision' | 'fallback' = 'fallback';

  if (parsed.data.imageDataUrl) {
    try {
      raw = await analyzeWithGemini(parsed.data.imageDataUrl, parsed.data.titleHint);
      if (raw) source = 'gemini';
    } catch (error) {
      console.error('[AI Listing] Gemini analysis failed, trying next provider:', error);
    }

    if (!raw) {
      try {
        raw = await analyzeWithOpenRouterVision(parsed.data.imageDataUrl, parsed.data.titleHint);
        if (raw) source = 'vision';
      } catch (error) {
        console.error('[AI Listing] OpenRouter vision analysis failed, using local fallback:', error);
      }
    }
  }

  let analysis = analysisSchema.safeParse(raw);
  if (!analysis.success) {
    source = 'fallback';
    analysis = analysisSchema.safeParse(fallbackAnalysis(parsed.data.titleHint));
  }
  if (!analysis.success) return NextResponse.json({ error: 'Could not produce a valid listing draft' }, { status: 502 });

  const value = analysis.data;
  const attributes = Object.fromEntries(
    Object.entries(value.attributes).map(([key, item]) => [key, Array.isArray(item) ? item.join(', ') : String(item)]),
  );
  return NextResponse.json({
    source,
    priceGrounded: source === 'gemini' && value.grounded,
    category: value.category,
    subcategories: value.category.split(/\s*>\s*/).slice(1),
    title: value.title,
    description: value.description,
    condition: value.condition,
    suggestedPriceSek: value.suggested_price_sek,
    estimatedAge: value.estimated_age,
    estimatedWeightKg: value.estimated_weight_kg,
    attributes,
    attributeOptions: Object.fromEntries(Object.entries(attributes).map(([key, item]) => [key, [item]])),
    tags: [...new Set(value.category.split(/\s*>\s*/).concat(Object.values(attributes)).filter(Boolean))].slice(0, 8),
    rawResponse: value,
  });
}
