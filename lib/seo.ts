import { headers } from 'next/headers';
import type { Metadata } from 'next';

// circucity.com and circucity.se are one Next app behind one nginx upstream, so
// everything that emits an absolute URL for search engines has to be derived from
// the request rather than hardcoded. This is the single place that knows the two
// origins and how to build a page's canonical + hreflang set from them.

export const SITE_ORIGINS = {
    se: 'https://circucity.se',
    com: 'https://circucity.com',
} as const;

export async function resolveSiteOrigin(): Promise<{ origin: string; isSwedish: boolean }> {
    const host = (await headers()).get('host')?.toLowerCase() ?? '';
    const isSwedish = host.endsWith('circucity.se');
    return { origin: isSwedish ? SITE_ORIGINS.se : SITE_ORIGINS.com, isSwedish };
}

// The pathname of the current request, as stamped by middleware. Metadata
// functions can't see the URL on their own, and without this every route
// inherits the root layout's alternates -- which is how every product page
// ended up declaring the homepage as its canonical.
export async function currentPathname(): Promise<string> {
    const raw = (await headers()).get('x-pathname') ?? '/';
    // Query strings never belong in a canonical: /products?category=X → /products.
    return raw.split('?')[0] || '/';
}

// Self-referencing canonical plus the hreflang pair for one path. Google wants
// the alternates to be absolute and to point at the *same page* on the other
// domain, not at that domain's homepage.
export function pageAlternates(pathname: string): NonNullable<Metadata['alternates']> {
    const path = pathname === '/' ? '' : pathname;
    return {
        canonical: pathname,
        languages: {
            'sv-SE': `${SITE_ORIGINS.se}${path}`,
            en: `${SITE_ORIGINS.com}${path}`,
            'x-default': `${SITE_ORIGINS.com}${path}`,
        },
    };
}

// Trim a product description to a search-snippet length at a word boundary.
export function snippet(text: string | null | undefined, max = 155): string | undefined {
    if (!text) return undefined;
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\-–—]+$/, '') + '…';
}
