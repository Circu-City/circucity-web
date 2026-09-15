import { MetadataRoute } from 'next';
import { resolveSiteOrigin } from '@/lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const { origin } = await resolveSiteOrigin();

    return {
        rules: {
            userAgent: '*',
            // Product images are served from /api/uploads. A bare `Disallow: /api/`
            // was blocking every one of them from Google Images. The more specific
            // Allow wins over the Disallow for that prefix.
            allow: ['/', '/api/uploads'],
            disallow: ['/api/', '/dashboard/admin/', '/dashboard/seller/'],
        },
        sitemap: `${origin}/sitemap.xml`,
        host: origin,
    };
}
