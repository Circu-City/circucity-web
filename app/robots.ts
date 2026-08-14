import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/admin/', '/dashboard/seller/'],
        },
        sitemap: 'https://circucity.com/sitemap.xml',
    };
}
