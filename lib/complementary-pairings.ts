import prisma from "@/lib/prisma";
import type { Product, Category } from "@prisma/client";

export type ProductWithCategory = Product & { category: Category };

export type PairingType =
  // Sustainable Fashion
  | "top" | "bottom" | "dress" | "outerwear" | "shoes" | "bag" | "jewelry" | "accessory"
  // Eco Home
  | "home_decor" | "home_kitchen" | "home_textile" | "home_furniture" | "home_lighting"
  // Green Gadgets
  | "gadget_power" | "gadget_light" | "gadget_sensor"
  // Skincare
  | "skincare_cleanser" | "skincare_moisturizer" | "skincare_treatment" | "skincare_soap"
  // Recycled Items (cross-cuts function; about material/provenance)
  | "recycled_decor" | "recycled_furniture" | "recycled_accessory"
  // Electronics / catch-all
  | "device" | "device_accessory" | "other";

export const TYPE_PAIRINGS: Record<PairingType, PairingType[]> = {
  top: ["bottom", "shoes", "outerwear", "jewelry", "accessory"],
  bottom: ["top", "shoes", "outerwear", "accessory"],
  dress: ["shoes", "jewelry", "bag", "outerwear"],
  outerwear: ["top", "bottom", "dress"],
  shoes: ["top", "bottom", "dress", "accessory"],
  bag: ["top", "bottom", "dress", "shoes"],
  jewelry: ["top", "dress", "accessory"],
  accessory: ["top", "bottom", "dress", "jewelry"],

  home_decor: ["home_lighting", "home_textile", "recycled_decor"],
  home_kitchen: ["home_textile", "recycled_decor"],
  home_textile: ["home_decor", "home_kitchen"],
  home_furniture: ["home_decor", "home_lighting", "recycled_furniture"],
  home_lighting: ["home_decor", "gadget_light"],

  gadget_power: ["gadget_light", "gadget_sensor", "device_accessory"],
  gadget_light: ["home_lighting", "gadget_power"],
  gadget_sensor: ["gadget_power", "device_accessory"],

  skincare_cleanser: ["skincare_moisturizer", "skincare_treatment"],
  skincare_moisturizer: ["skincare_cleanser", "skincare_treatment"],
  skincare_treatment: ["skincare_cleanser", "skincare_moisturizer"],
  skincare_soap: ["skincare_moisturizer", "home_textile"],

  recycled_decor: ["home_decor", "home_lighting"],
  recycled_furniture: ["home_furniture", "home_decor"],
  recycled_accessory: ["top", "bottom", "dress", "bag"],

  device: ["device_accessory", "gadget_power"],
  device_accessory: ["device", "gadget_power"],
  other: [],
};

export const CATEGORY_PAIRINGS: Record<string, string[]> = {
  "Sustainable Fashion": ["Sustainable Fashion", "Recycled Items"],
  "Eco Home": ["Recycled Items", "Green Gadgets"],
  "Recycled Items": ["Eco Home", "Sustainable Fashion"],
  "Green Gadgets": ["Eco Home", "Electronics"],
  "Skincare": ["Sustainable Fashion", "Eco Home"],
  "Electronics": ["Green Gadgets"],
  "General": ["General"],
};

// Keyword patterns per type. Includes a few Swedish terms (this is a Swedish
// marketplace and some listings use Swedish words, e.g. "snickers" for sneakers).
const TYPE_KEYWORDS: Partial<Record<PairingType, RegExp>> = {
  top: /\b(t-?shirts?|shirts?|hoodies?|sweaters?|jumpers?|blouses?|tank tops?|cardigans?)\b/i,
  bottom: /\b(jeans|pants|trousers|shorts|skirts?|leggings)\b/i,
  dress: /\bdress(es)?\b/i,
  outerwear: /\b(jackets?|coats?|parkas?|blazers?|windbreakers?)\b/i,
  shoes: /\b(shoes?|sneakers?|snickers?|sandals?|slides?|boots?|loafers?|flip.?flops?)\b/i,
  bag: /\b(bags?|totes?|backpacks?|purses?|handbags?)\b/i,
  jewelry: /\b(bracelets?|necklaces?|rings?|earrings?|jewel(le)?ry|pendants?)\b/i,
  accessory: /\b(scarves|scarfs?|belts?|hats?|caps?|gloves?|wristbands?|sunglasses|beanies?)\b/i,

  home_decor: /\b(vases?|plant pots?|planters?|candles?|ornaments?|frames?|sculptures?)\b/i,
  home_kitchen: /\b(cutting boards?|mugs?|plates?|bowls?|water bottles?|drinking|glass(es|ware)?|kitchen|cookware|utensils?)\b/i,
  home_textile: /\b(towels?|blankets?|cushions?|pillows?|rugs?|curtains?|napkins?|wraps?)\b/i,
  home_furniture: /\b(chairs?|tables?|desks?|sofas?|couch(es)?|shel(f|ves|ving)|furniture|stools?)\b/i,
  home_lighting: /\b(lamps?|lights?|led|lighting|lanterns?)\b/i,

  gadget_power: /\b(chargers?|power banks?|batter(y|ies)|solar.?powered)\b/i,
  gadget_sensor: /\b(sensors?|monitors?|trackers?|thermostats?)\b/i,

  skincare_cleanser: /\b(cleansers?|face wash|facial wash)\b/i,
  skincare_moisturizer: /\b(moisturi[sz]ers?|creams?|lotions?)\b/i,
  skincare_treatment: /\b(serums?|treatments?|balms?|lip balm)\b/i,
  skincare_soap: /\b(soaps?|shampoos?)\b/i,

  device: /\b(phones?|iphones?|smartphones?|laptops?|tablets?|computers?|notebooks?)\b/i,
  device_accessory: /\b(earbuds?|earphones?|headphones?|cases?|cables?|adapters?)\b/i,
};
// gadget_light reuses the home_lighting keyword pattern (same vocabulary: lamp/light/led).
TYPE_KEYWORDS.gadget_light = TYPE_KEYWORDS.home_lighting;
// The "recycled_*" types are provenance labels, not distinct vocabulary — classify
// via their functional counterparts and let CATEGORY_PAIRINGS carry the "recycled" framing.
TYPE_KEYWORDS.recycled_decor = TYPE_KEYWORDS.home_decor;
TYPE_KEYWORDS.recycled_furniture = TYPE_KEYWORDS.home_furniture;
TYPE_KEYWORDS.recycled_accessory = /\b(bags?|totes?|backpacks?|purses?|wristbands?|sandals?|jewel(le)?ry|bracelets?)\b/i;

// Category-scoped candidate order: tried first (in this order) before falling back
// to every known type. Keeps false positives down (e.g. a Skincare item never gets
// tested against "chair"/"lamp" keywords first) while still catching miscategorized
// listings on the second pass.
const CATEGORY_CANDIDATES: Record<string, PairingType[]> = {
  "Sustainable Fashion": ["dress", "outerwear", "shoes", "bag", "jewelry", "bottom", "top", "accessory"],
  "Recycled Items": ["shoes", "bag", "recycled_accessory", "accessory", "home_kitchen", "home_decor", "home_textile", "home_furniture"],
  "Eco Home": ["home_kitchen", "home_decor", "home_furniture", "home_lighting", "home_textile", "device_accessory"],
  "Green Gadgets": ["gadget_light", "gadget_power", "gadget_sensor", "device", "device_accessory"],
  "Skincare": ["skincare_cleanser", "skincare_moisturizer", "skincare_treatment", "skincare_soap"],
  "Electronics": ["device", "device_accessory"],
  "General": [],
};

export function classifyTypeFromText(
  name: string,
  description?: string | null,
  categoryName?: string | null,
): PairingType {
  const text = `${name} ${description || ""}`;

  const tryList = (list: PairingType[]): PairingType | null => {
    for (const t of list) {
      const re = TYPE_KEYWORDS[t];
      if (re && re.test(text)) return t;
    }
    return null;
  };

  const scoped = categoryName ? CATEGORY_CANDIDATES[categoryName] : undefined;
  if (scoped) {
    const hit = tryList(scoped);
    if (hit) return hit;
  }

  // Second pass: full vocabulary, catches miscategorized listings (e.g. a pair of
  // sneakers filed under "Eco Home") that the category-scoped pass would miss.
  const all = Object.keys(TYPE_KEYWORDS) as PairingType[];
  return tryList(all) || "other";
}

export type ComplementaryQuery = {
  productId: string;
  categoryId: string;
  categoryName: string;
  type: PairingType | null;
  limit?: number;
};

export async function getComplementaryProducts({
  productId,
  categoryName,
  type,
  limit = 4,
}: ComplementaryQuery): Promise<ProductWithCategory[]> {
  const results: ProductWithCategory[] = [];
  const seenIds = new Set<string>([productId]);

  if (type && type !== "other") {
    const complementTypes = TYPE_PAIRINGS[type] || [];
    if (complementTypes.length > 0) {
      const tierA = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: Array.from(seenIds) },
          OR: complementTypes.map((t) => ({
            attributes: { path: "$.type", equals: t },
          })),
        },
        include: { category: true },
        take: limit,
      });
      for (const p of tierA) {
        results.push(p);
        seenIds.add(p.id);
      }
    }
  }

  if (results.length < limit) {
    const fallbackCategories = CATEGORY_PAIRINGS[categoryName] ?? [categoryName];
    const tierB = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: Array.from(seenIds) },
        category: { name: { in: fallbackCategories } },
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit - results.length,
    });
    for (const p of tierB) {
      results.push(p);
      seenIds.add(p.id);
    }
  }

  return results;
}

export async function getComplementaryProductsForMany(
  productIds: string[],
  limit = 3,
): Promise<ProductWithCategory[]> {
  if (productIds.length === 0) return [];

  const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });
  if (cartProducts.length === 0) return [];

  const results: ProductWithCategory[] = [];
  const seenIds = new Set<string>(productIds);

  for (const cp of cartProducts) {
    if (results.length >= limit) break;
    const attrs = (cp.attributes as Record<string, unknown> | null) || null;
    const type = (attrs?.type as PairingType | undefined) ?? null;
    const remaining = limit - results.length;
    const complements = await getComplementaryProducts({
      productId: cp.id,
      categoryId: cp.categoryId,
      categoryName: cp.category.name,
      type,
      limit: remaining,
    });
    for (const p of complements) {
      if (seenIds.has(p.id)) continue;
      results.push(p);
      seenIds.add(p.id);
      if (results.length >= limit) break;
    }
  }

  return results;
}
