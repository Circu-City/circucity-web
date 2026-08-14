import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "CircuCity - Your Destination for Sustainable Living",
  description: "Join the eco-friendly revolution. Shop organic, recycled, and sustainable products at CircuCity. Reduce your carbon footprint today.",
  keywords: ["sustainable", "eco-friendly", "organic", "recycled", "marketplace", "green living", "swap", "circular economy"],
  icons: { icon: '/favicon.png' },
  metadataBase: new URL('https://circucity.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: "CircuCity - Sustainable Living Marketplace",
    description: "Shop conscious. Live sustainable. Discover eco-friendly products that make a difference.",
    url: 'https://circucity.com',
    siteName: 'CircuCity',
    locale: 'en_US',
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

import { ClerkProvider } from "@clerk/nextjs";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LanguageProvider } from "@/components/context/LanguageContext";
import { CartProvider } from "@/components/providers/CartProvider";
import { auth } from "@clerk/nextjs/server";
import { getUserRoleFromDb } from "@/utils/roles";
import { Analytics } from "@/components/analytics/Analytics";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <html lang="en" suppressHydrationWarning>
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
          <script dangerouslySetInnerHTML={{
            __html: `window.addEventListener('pageshow',function(e){if(e.persisted)window.location.reload()})`
          }} />
          </body>
      </html>
    </ClerkProvider>
  );
}
