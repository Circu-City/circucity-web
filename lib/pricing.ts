export const SHIELD_FEE_PERCENTAGE = 0.06; // 6% fee
export const SHIELD_FEE_FIXED = 8; // 8 SEK fixed fee

/**
 * Formats a number as a SEK currency string.
 * @param amount The amount in SEK.
 * @returns Formatted string (e.g., "100 kr").
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Calculates the Shield Fee added at checkout.
 * @param itemPrice The price of the item.
 * @returns The requested Shield fee amount.
 */
export function calculateShieldFee(itemPrice: number): number {
    return Number((itemPrice * SHIELD_FEE_PERCENTAGE + SHIELD_FEE_FIXED).toFixed(2));
}
