import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://circucity.com';

    const staticRoutes = [
        '', '/about', '/about-us', '/become-seller', '/cart', '/cancel',
        '/dashboard', '/eco-home', '/eco-tokens', '/green-gadgets',
        '/help-center', '/leaderboard', '/notifications',
        '/privacy-policy', '/products', '/recycled-items', '/return-policy',
        '/shipping-policy', '/sign-in', '/sign-up', '/skincare',
        '/success', '/sustainable-fashion', '/swap', '/terms-of-service',
        '/wishlist',
    ];

    return staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/products' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/products' ? 0.9 : 0.7,
    })) as MetadataRoute.Sitemap;
}
