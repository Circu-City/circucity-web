import { NextRequest, NextResponse } from 'next/server';
import { searchEmissionFactors, estimateEmissions } from '@/lib/climatiq';

const MATERIALS = [
    'cotton', 'polyester', 'nylon', 'wool', 'silk', 'leather', 'denim', 'linen',
    'wood', 'bamboo', 'metal', 'steel', 'aluminum', 'copper', 'plastic', 'glass',
    'ceramic', 'paper', 'cardboard', 'rubber', 'silicone', 'electronics'
];

const FALLBACK_FACTORS: Record<string, number> = {
    // Categories (kg CO2e per kg)
    'Clothing': 15.0,
    'Electronics': 50.0,
    'Furniture': 2.5,
    'Home & Garden': 3.0,
    'Toys': 4.0,
    'Books': 1.0,
    'Sports': 8.0,
    'Beauty': 5.0,

    // Materials (kg CO2e per kg)
    'cotton': 8.3,
    'polyester': 14.2,
    'nylon': 18.0,
    'wool': 13.9,
    'silk': 20.0,
    'leather': 40.0, // High impact
    'denim': 12.0,
    'linen': 4.5,
    'wood': 0.5,
    'bamboo': 0.2, // Very low impact
    'metal': 8.0,
    'steel': 1.8,
    'aluminum': 12.0,
    'copper': 3.5,
    'plastic': 3.5,
    'glass': 0.9,
    'ceramic': 0.7,
    'paper': 0.9,
    'cardboard': 0.8,
    'rubber': 2.5,
    'silicone': 3.0,
    'electronics': 45.0
};

function extractAttributes(text: string): string {
    if (!text) return '';
    const lowerText = text.toLowerCase();
    const found = MATERIALS.filter(m => lowerText.includes(m));
    return found.join(' ');
}

function getFallbackFactor(category: string, description: string): { factor: number, source: string } {
    const text = (category + ' ' + description).toLowerCase();

    // Check materials first (more specific)
    for (const [key, value] of Object.entries(FALLBACK_FACTORS)) {
        if (text.includes(key.toLowerCase()) && key !== 'Clothing') { // Avoid generic 'clothing' if specific material exists? actually key != category is better
            // If the key is 'cotton' and text includes 'cotton', we match.
            return { factor: value, source: `Fallback - Material: ${key}` };
        }
    }

    // Check category matches
    for (const [key, value] of Object.entries(FALLBACK_FACTORS)) {
        if (category.toLowerCase().includes(key.toLowerCase())) {
            return { factor: value, source: `Fallback - Category: ${key}` };
        }
    }

    return { factor: 5.0, source: 'Fallback - Generic Average' }; // Generic fallback
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, category, weight, price, weightUnit = 'kg', currency = 'SEK' } = body;

        if (!weight || !category) {
            return NextResponse.json(
                { error: 'Weight and Category are required for estimation' },
                { status: 400 }
            );
        }

        let amount = parseFloat(weight);
        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Valid weight required' }, { status: 400 });
        }

        // Try API First
        try {
            // 1. Search Strategy
            let factors: any[] = [];
            const attributes = extractAttributes(description);

            // A. Try "Category + Attributes + Name" (Most Specific)
            if (attributes) {
                factors = await searchEmissionFactors(`${category} ${attributes} ${name}`);
            }

            // B. Try "Category + Name"
            if (factors.length === 0) {
                factors = await searchEmissionFactors(`${category} ${name}`);
            }

            // C. Try "Attributes + Category" (If name is too specific)
            if (factors.length === 0 && attributes) {
                factors = await searchEmissionFactors(`${attributes} ${category}`);
            }

            // D. Try "Name" alone
            if (factors.length === 0) {
                factors = await searchEmissionFactors(name);
            }

            // E. Try "Category" alone
            if (factors.length === 0) {
                factors = await searchEmissionFactors(category);
            }

            if (factors.length > 0) {
                const weightFactor = factors.find((f: any) => f.unit_type === 'Weight');
                const selectedFactor = weightFactor || factors[0];

                // If we found a valid factor that supports weight, use it
                if (selectedFactor && (selectedFactor.unit_type === 'Weight' || selectedFactor.unit_type === 'Number')) {
                    const estimate = await estimateEmissions(selectedFactor.id, amount, weightUnit.toLowerCase(), selectedFactor.unit_type);
                    if (estimate) {
                        return NextResponse.json({
                            footprint: estimate.co2e,
                            saved: estimate.co2e * 0.9,
                            unit: estimate.co2e_unit,
                            factor_name: selectedFactor.name,
                            factor_category: selectedFactor.category
                        });
                    }
                } else if (selectedFactor && selectedFactor.unit_type === 'Money') {
                    // Handle money-based factors properly if weight-based failed (though we prioritize weight)
                    const moneyAmount = parseFloat(price || "0");
                    if (moneyAmount > 0) {
                        const estimate = await estimateEmissions(selectedFactor.id, moneyAmount, currency.toLowerCase(), 'Money');
                        if (estimate) {
                            return NextResponse.json({
                                footprint: estimate.co2e,
                                saved: estimate.co2e * 0.9,
                                unit: estimate.co2e_unit,
                                factor_name: selectedFactor.name,
                                factor_category: selectedFactor.category
                            });
                        }
                    }
                }
            }
            // If we get here, either no factors found or estimation failed silently. Fall through to fallback.
            console.warn("Climatiq API returned no useful results, using fallback.");

        } catch (apiError) {
            console.error('Climatiq API Error (Quota/Rate Limit?):', apiError);
            // Proceed to fallback
        }

        // 2. Fallback Calculation
        const { factor, source } = getFallbackFactor(category, description || name);
        const estimatedFootprint = amount * factor; // kg CO2e

        return NextResponse.json({
            footprint: estimatedFootprint,
            saved: estimatedFootprint * 0.9, // 90% savings assumption
            unit: 'kgCO2e',
            factor_name: source,
            factor_category: 'Estimated Average'
        });

    } catch (error) {
        console.error('Estimate API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
