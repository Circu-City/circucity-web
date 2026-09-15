import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { resolveSiteOrigin, SITE_ORIGINS } from '@/lib/seo';

// Only pages a search engine should ever be sent to. The previous list also
// submitted /cart, /dashboard, /sign-in, /sign-up, /notifications, /wishlist,
// /success and /cancel -- account and checkout states with nothing to rank.
const STATIC_ROUTES: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly'; priority: number }> = [
    { path: '',                     changeFrequency: 'daily',   priority: 1.0 },
    { path: '/products',            changeFrequency: 'daily',   priority: 0.9 },
    { path: '/shops',               changeFrequency: 'weekly',  priority: 0.8 },
    { path: '/swap',                changeFrequency: 'daily',   priority: 0.8 },
    { path: '/eco-home',            changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/green-gadgets',       changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/recycled-items',      changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/skincare',            changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/sustainable-fashion', changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/eco-tokens',          changeFrequency: 'weekly',  priority: 0.6 },
    { path: '/leaderboard',         changeFrequency: 'daily',   priority: 0.5 },
    { path: '/become-seller',       changeFrequency: 'monthly', priority: 0.6 },
    { path: '/about',               changeFrequency: 'monthly', priority: 0.4 },
    { path: '/about-us',            changeFrequency: 'monthly', priority: 0.4 },
    { path: '/help-center',         changeFrequency: 'monthly', priority: 0.4 },
    { path: '/shipping-policy',     changeFrequency: 'monthly', priority: 0.3 },
    { path: '/return-policy',       changeFrequency: 'monthly', priority: 0.3 },
    { path: '/privacy-policy',      changeFrequency: 'monthly', priority: 0.2 },
    { path: '/terms-of-service',    changeFrequency: 'monthly', priority: 0.2 },
];

function entry(
    baseUrl: string,
    path: string,
    lastModified: Date,
    changeFrequency: 'daily' | 'weekly' | 'monthly',
    priority: number,
): MetadataRoute.Sitemap[number] {
    return {
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency,
        priority,
        // Same page on the other domain -- not that domain's homepage.
        alternates: {
            languages: {
                'sv-SE': `${SITE_ORIGINS.se}${path}`,
                en: `${SITE_ORIGINS.com}${path}`,
            },
        },
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { origin: baseUrl } = await resolveSiteOrigin();

    // The static list used `lastModified: new Date()` on every entry, which told
    // Google the whole site changed every time it looked and taught it to ignore
    // the field. Products and shops carry a real updatedAt; static pages get one
    // fixed date that only moves when their content actually does.
    const staticStamp = new Date('2026-09-15');

    const [products, shops] = await Promise.all([
        prisma.product.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        }),
        prisma.shop.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        }),
    ]);

    return [
        ...STATIC_ROUTES.map((r) => entry(baseUrl, r.path, staticStamp, r.changeFrequency, r.priority)),
        ...products.map((p) => entry(baseUrl, `/products/${p.id}`, p.updatedAt, 'weekly', 0.8)),
        ...shops.map((s) => entry(baseUrl, `/shop/${s.id}`, s.updatedAt, 'weekly', 0.6)),
    ];
}
