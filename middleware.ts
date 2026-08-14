import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/become-seller(.*)',
]);

const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.circucity.com https://*.circucity.ai https://cdn.jsdelivr.net https://js.stripe.com https://accounts.google.com https://*.clerk.com https://clerk.circucity.com; worker-src 'self' blob:; connect-src 'self' https://*.circucity.com https://*.circucity.ai https://api.github.com wss://*.circucity.com; img-src 'self' data: blob: https://*.circucity.com https://*.circucity.ai https://img.clerk.com https://cdn.jsdelivr.net https://images.unsplash.com https://utfs.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com https://accounts.google.com https://*.clerk.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, path: string): boolean {
    const key = `${ip}:${path}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
        return false;
    }
    entry.count++;
    return entry.count > 20;
}

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/api/') && req.method === 'POST') {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';
        if (isRateLimited(ip, pathname)) {
            return new NextResponse(JSON.stringify({ success: false, error: 'Too many requests' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
            });
        }
    }

    if (isProtectedRoute(req) && !userId) {
        const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').replace(/:.*$/, '');
        const proto = req.headers.get('x-forwarded-proto') || 'https';
        const path = new URL(req.url, 'http://placeholder').pathname + new URL(req.url, 'http://placeholder').search;
        const baseUrl = proto + '://' + host;
        const returnBackUrl = baseUrl + path;
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', returnBackUrl);
        return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    if (req.nextUrl.searchParams.get('reset_css') === '1') {
        response.headers.set('Clear-Site-Data', '"cache"');
    }
    return response;
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
