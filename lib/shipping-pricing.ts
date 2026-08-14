export const POSTNORD_CONTRACT_RATES: Record<string, number> = {
    "3": 77.60,
    "5": 106.40,
    "10": 143.20,
    "15": 175.20,
    "20": 205.60,
    "25": 271.20,
    "30": 317.60
};

export const HANDLING_FEE_PERCENTAGE = 0.10;

export interface ShippingCost {
    carrierCost: number;
    handlingFee: number;
    totalShippingPrice: number;
    carrier: string;
}

export function calculatePostNordCost(weightKg: number): ShippingCost {
    const tiers = Object.keys(POSTNORD_CONTRACT_RATES).map(Number).sort((a, b) => a - b);
    let tier = tiers.find(t => t >= weightKg);
    if (!tier) tier = tiers[tiers.length - 1];

    const carrierCost = POSTNORD_CONTRACT_RATES[String(tier)] || POSTNORD_CONTRACT_RATES["30"];
    const handlingFee = parseFloat((carrierCost * HANDLING_FEE_PERCENTAGE).toFixed(2));
    const totalShippingPrice = parseFloat((carrierCost + handlingFee).toFixed(2));

    return { carrierCost, handlingFee, totalShippingPrice, carrier: "PostNord" };
}

export async function calculateShipmondoCost(weightKg: number, fromZip: string, toZip: string): Promise<ShippingCost | null> {
    try {
        const SHIPMONDO_BASE = "https://app.shipmondo.com/api/public/v3";
        const user = process.env.SHIPMONDO_API_USER || "";
        const key = process.env.SHIPMONDO_API_KEY || "";
        if (!user || !key) return null;

        const encoded = Buffer.from(`${user}:${key}`).toString("base64");

        const res = await fetch(`${SHIPMONDO_BASE}/shipment_quotes`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${encoded}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { country_code: "SE", zipcode: fromZip || "93136" },
                receiver: { country_code: "SE", zipcode: toZip || "11120" },
                parcels: [{ weight: weightKg, length: 30, width: 30, height: 15 }],
            }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        const quotes = data?.data || [];
        if (quotes.length === 0) return null;

        const cheapest = quotes.reduce((min: any, q: any) => (q.price < min.price ? q : min), quotes[0]);
        const carrierCost = parseFloat(cheapest.price) || 0;
        const handlingFee = parseFloat((carrierCost * HANDLING_FEE_PERCENTAGE).toFixed(2));
        const totalShippingPrice = parseFloat((carrierCost + handlingFee).toFixed(2));

        return { carrierCost, handlingFee, totalShippingPrice, carrier: cheapest.carrier || "Shipmondo" };
    } catch {
        return null;
    }
}

export function calculateShippingCost(weightKg: number, carrier: "postnord" | "shipmondo" = "postnord"): ShippingCost {
    if (carrier === "shipmondo") {
        const postNordCost = calculatePostNordCost(weightKg);
        const shipmondoPrice = parseFloat((postNordCost.totalShippingPrice * 0.95).toFixed(2));
        const carrierCost = parseFloat((shipmondoPrice / 1.10).toFixed(2)); // 10% handling fee included
        const handlingFee = parseFloat((shipmondoPrice - carrierCost).toFixed(2));
        return { carrierCost, handlingFee, totalShippingPrice: shipmondoPrice, carrier: "Shipmondo" };
    }
    return calculatePostNordCost(weightKg);
}
