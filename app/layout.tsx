import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { resolveSiteOrigin, currentPathname, pageAlternates } from "@/lib/seo";
import "./globals.css";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// circucity.com and circucity.se are the same Next app behind one nginx upstream.
// Everything absolute here is derived from the request: metadataBase from the
// host, and canonical/hreflang from the pathname middleware stamps on the
// request. Every route inherits this block unless it defines its own
// `alternates`, so a hardcoded canonical here becomes every page's canonical --
// which is exactly the bug this replaces.
export async function generateMetadata(): Promise<Metadata> {
  const [{ origin, isSwedish }, pathname] = await Promise.all([resolveSiteOrigin(), currentPathname()]);

  return {
    title: "CircuCity - Your Destination for Sustainable Living",
    description: "Join the eco-friendly revolution. Shop organic, recycled, and sustainable products at CircuCity. Reduce your carbon footprint today.",
    keywords: ["sustainable", "eco-friendly", "organic", "recycled", "marketplace", "green living", "swap", "circular economy"],
    icons: { icon: '/favicon.png' },
    metadataBase: new URL(origin),
    alternates: pageAlternates(pathname),
    openGraph: {
      title: "CircuCity - Sustainable Living Marketplace",
      description: "Shop conscious. Live sustainable. Discover eco-friendly products that make a difference.",
      url: pathname,
      siteName: 'CircuCity',
      locale: isSwedish ? 'sv_SE' : 'en_US',
      type: 'website',
      images: [{ url: '/logo-white.png', width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'CircuCity - Sustainable Living Marketplace',
      description: 'Shop conscious. Live sustainable. Discover eco-friendly products that make a difference.',
      images: ['/logo-white.png'],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

import { ClerkProvider } from "@clerk/nextjs";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LanguageProvider } from "@/components/context/LanguageContext";
import { CartProvider } from "@/components/providers/CartProvider";
import { auth } from "@clerk/nextjs/server";
import { getUserRoleFromDb } from "@/utils/roles";
import { Analytics } from "@/components/analytics/Analytics";
import Translator from "@/components/Translator";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSwedish } = await resolveSiteOrigin();
  let isAdmin = false;
  let isSeller = false;

  try {
    const { userId } = await auth();
    if (userId) {
      const user = await getUserRoleFromDb(userId);
      if (user?.role === 'ADMIN') {
        isAdmin = true;
      }
      if (user?.role === 'SELLER' || user?.role === 'ADMIN') {
        isSeller = true;
      }
    }
  } catch {
  }
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang={isSwedish ? "sv" : "en"} suppressHydrationWarning>
        <head>
        </head>
        <body suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        >
          <LanguageProvider>
            <CartProvider>
                <ClientLayout isAdmin={isAdmin} isSeller={isSeller}>{children}</ClientLayout>
            </CartProvider>
          </LanguageProvider>
          <CookieConsent />
          <Toaster position="top-right" richColors />
          <Analytics />
          <Translator />
          <script dangerouslySetInnerHTML={{
            __html: `window.addEventListener('pageshow',function(e){if(e.persisted)window.location.reload()})`
          }} />
          </body>
      </html>
    </ClerkProvider>
  );
}
