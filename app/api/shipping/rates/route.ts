import { NextRequest, NextResponse } from "next/server";
import { calculatePostNordCost } from "@/lib/shipping-pricing";

export async function POST(req: NextRequest) {
    try {
        const { weight } = await req.json();
        const weightKg = Number(weight) || 0;

        const postnord = calculatePostNordCost(weightKg);
        const shipmondo = parseFloat((postnord.totalShippingPrice * 0.95).toFixed(2));

        return NextResponse.json({
            postnord: postnord.totalShippingPrice,
            shipmondo,
        });
    } catch {
        return NextResponse.json({ postnord: 85.36, shipmondo: 81.09 });
    }
}

