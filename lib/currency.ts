type CurrencyInfo = { code: string; symbol: string; rate: number; locale: string };

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  SE: { code: 'SEK', symbol: 'kr', rate: 1, locale: 'sv-SE' },
  DK: { code: 'DKK', symbol: 'kr', rate: 0.7, locale: 'da-DK' },
  NO: { code: 'NOK', symbol: 'kr', rate: 0.98, locale: 'nb-NO' },
  FI: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'fi-FI' },
  DE: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'de-DE' },
  FR: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'fr-FR' },
  IT: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'it-IT' },
  ES: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'es-ES' },
  NL: { code: 'EUR', symbol: '€', rate: 0.088, locale: 'nl-NL' },
  GB: { code: 'GBP', symbol: '£', rate: 0.076, locale: 'en-GB' },
  US: { code: 'USD', symbol: '$', rate: 0.096, locale: 'en-US' },
  CA: { code: 'CAD', symbol: 'C$', rate: 0.13, locale: 'en-CA' },
  AU: { code: 'AUD', symbol: 'A$', rate: 0.15, locale: 'en-AU' },
  JP: { code: 'JPY', symbol: '¥', rate: 14.4, locale: 'ja-JP' },
  PL: { code: 'PLN', symbol: 'zł', rate: 0.38, locale: 'pl-PL' },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'SEK', symbol: 'kr', rate: 1, locale: 'sv-SE' };

let cachedCurrency: CurrencyInfo | null = null;

export async function detectCurrency(): Promise<CurrencyInfo> {
  if (cachedCurrency) return cachedCurrency;
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('geo lookup failed');
    const data = await res.json();
    const countryCode = data?.country_code || 'SE';
    cachedCurrency = CURRENCY_MAP[countryCode] || DEFAULT_CURRENCY;
    return cachedCurrency;
  } catch {
    cachedCurrency = DEFAULT_CURRENCY;
    return DEFAULT_CURRENCY;
  }
}

export function formatPriceInCurrency(priceSek: number, currency: CurrencyInfo): string {
  const converted = priceSek * currency.rate;
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(converted);
  } catch {
    return `${currency.symbol}${converted.toFixed(2)}`;
  }
}
