'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RagChatWidget } from '@/components/chat/RagChatWidget';
import { FloatingCart } from '@/components/cart/FloatingCart';
import { ReferralTracker } from '@/components/layout/ReferralTracker';
import { DailyLoginTracker } from '@/components/layout/DailyLoginTracker';

function BehaviorTracker() {
    const pathname = usePathname();
    const { user } = useUser();

    useEffect(() => {
        if (!pathname) return;
        const startTime = Date.now();
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id || null, page: pathname, action: 'pageview', data: { startTime } }),
        }).catch(() => {});
        return () => {
            const duration = Date.now() - startTime;
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id || null, page: pathname, action: 'pageleave', data: { duration } }),
            }).catch(() => {});
        };
    }, [pathname, user?.id]);

    return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div key={pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
        </div>
    );
}

export function ClientLayout({ children, isAdmin = false, isSeller = false }: { children: React.ReactNode; isAdmin?: boolean; isSeller?: boolean }) {
    const pathname = usePathname();

    const isSellerDashboard = pathname?.startsWith('/dashboard/seller');
    const isAdminDashboard = pathname?.startsWith('/dashboard/admin');

    if (isSellerDashboard) {
        return (
            <>
                {children}
                <RagChatWidget />
            </>
        );
    }

    return (
          <div className="flex flex-col min-h-screen">
            <ReferralTracker />
            <DailyLoginTracker />
            <BehaviorTracker />
            <Header isAdmin={isAdmin} isSeller={isSeller} hideNavigation={isAdminDashboard} />
            <main className="flex-1">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
            {!isAdminDashboard && <Footer />}
            <RagChatWidget />
            <FloatingCart />
        </div>
    );
}
