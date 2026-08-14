import { NextRequest, NextResponse } from "next/server";
import { getComplementaryProductsForMany } from "@/lib/complementary-pairings";
import { getProductImages } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const { productIds } = await req.json();
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ products: [] });
        }

        const ids = productIds.filter((id) => typeof id === "string").slice(0, 50);
        const complements = await getComplementaryProductsForMany(ids, 3);

        const products = complements.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image: getProductImages(p.images)[0] || null,
            category: p.category.name,
        }));

        return NextResponse.json({ products });
    } catch {
        return NextResponse.json({ products: [] });
    }
}
