/**
 * Climatiq API Client
 * Documentation: https://www.climatiq.io/docs
 */

const CLIMATIQ_API_URL = 'https://api.climatiq.io/data/v1';

export interface EmissionFactor {
    id: string;
    name: string;
    category: string;
    sector: string;
    source: string;
    year: string;
    region: string;
    region_name: string;
    description: string;
    unit_type: string;
    unit: string;
}

export interface EstimateRequest {
    emission_factor_id: string;
    parameters: {
        [key: string]: string | number; // e.g., money: 100, money_unit: 'usd'
    };
}

export interface EstimateResponse {
    co2e: number;
    co2e_unit: string;
    emission_factor: EmissionFactor;
}

export async function searchEmissionFactors(query: string, category?: string): Promise<EmissionFactor[]> {
    const apiKey = process.env.CLIMATIQ_API_KEY;
    if (!apiKey) {
        console.warn('CLIMATIQ_API_KEY is not set');
        return [];
    }

    try {
        const params = new URLSearchParams({
            query,
            data_version: '^0', // Use latest data version
        });

        if (category) {
            params.append('category', category);
        }

        const response = await fetch(`${CLIMATIQ_API_URL}/search?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Climatiq search failed: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching Climatiq emission factors:', error);
        return [];
    }
}

export async function estimateEmissions(
    factorId: string,
    amount: number,
    unit: string,
    factorType?: string
): Promise<EstimateResponse | null> {
    const apiKey = process.env.CLIMATIQ_API_KEY;
    if (!apiKey) {
        console.warn('CLIMATIQ_API_KEY is not set');
        return null;
    }

    try {
        // Prepare parameters based on unit (simplified mapping)
        // Climatiq usually expects specific parameter names like 'weight', 'money', 'energy', etc.
        // We'll try to infer or pass 'weight' for kg/g, 'money' for currency.

        let parameters: Record<string, string | number> = {};

        if (factorType === 'Money') {
            parameters = { money: amount, money_unit: unit.toLowerCase() };
        } else if (factorType === 'Weight') {
            parameters = { weight: amount, weight_unit: unit.toLowerCase() };
        } else if (factorType === 'Number') {
            parameters = { number: amount };
        } else if (factorType === 'Energy') {
            parameters = { energy: amount, energy_unit: unit.toLowerCase() };
        } else {
            // Fallback heuristics if type not provided
            const lowerUnit = unit.toLowerCase();
            if (lowerUnit.includes('kg') || lowerUnit.includes('g') || lowerUnit.includes('ton')) {
                parameters = { weight: amount, weight_unit: lowerUnit };
            } else if (lowerUnit.includes('usd') || lowerUnit.includes('eur') || lowerUnit.includes('gbp') || lowerUnit.includes('sek')) {
                parameters = { money: amount, money_unit: lowerUnit };
            } else {
                // Default fallback
                parameters = { number: amount };
            }
        }

        const response = await fetch(`${CLIMATIQ_API_URL}/estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                emission_factor: {
                    id: factorId,
                },
                parameters
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Climatiq estimate failed: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error estimating emissions:', error);
        return null;
    }
}
