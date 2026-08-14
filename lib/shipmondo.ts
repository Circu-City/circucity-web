const SHIPMONDO_BASE = 'https://app.shipmondo.com/api/public/v3';

function getAuthHeaders(): Record<string, string> {
    const user = process.env.SHIPMONDO_API_USER || '';
    const key = process.env.SHIPMONDO_API_KEY || '';
    const encoded = Buffer.from(`${user}:${key}`).toString('base64');
    return {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
    };
}

export interface ShipmondoShipmentRequest {
    template_id?: number;
    sender?: { name: string; address1: string; city: string; zipcode: string; country_code: string };
    receiver?: { name: string; address1: string; city: string; zipcode: string; country_code: string; email?: string; mobile?: string };
    parcels?: Array<{ weight: number; length: number; width: number; height: number }>;
    reference?: string;
    test_mode?: boolean;
}

export interface ShipmondoQuoteRequest {
    sender: { country_code: string; zipcode: string };
    receiver: { country_code: string; zipcode: string };
    parcels: Array<{ weight: number; length?: number; width?: number; height?: number }>;
}

export async function getShipmondoShipmentTemplates() {
    const res = await fetch(`${SHIPMONDO_BASE}/shipment_templates`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Shipmondo templates error: ${res.status}`);
    return res.json();
}

export async function getShipmondoQuotes(params: ShipmondoQuoteRequest) {
    const res = await fetch(`${SHIPMONDO_BASE}/shipment_quotes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Shipmondo quote error: ${res.status}`);
    return res.json();
}

export async function createShipmondoShipment(params: ShipmondoShipmentRequest) {
    const res = await fetch(`${SHIPMONDO_BASE}/shipments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...params, test_mode: process.env.NODE_ENV !== 'production' }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shipmondo create error: ${res.status} - ${err}`);
    }
    return res.json();
}

export async function getShipmondoProducts(senderCountry: string, receiverCountry: string) {
    const res = await fetch(`${SHIPMONDO_BASE}/products?sender_country_code=${senderCountry}&receiver_country_code=${receiverCountry}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Shipmondo products error: ${res.status}`);
    return res.json();
}

export async function getShipmondoShipment(id: string | number) {
    const res = await fetch(`${SHIPMONDO_BASE}/shipments/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Shipmondo get error: ${res.status}`);
    return res.json();
}
