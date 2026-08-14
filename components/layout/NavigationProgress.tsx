'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const barRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        bar.style.width = '0%';
        bar.style.opacity = '1';

        const steps = [
            { width: '30%', delay: 50 },
            { width: '60%', delay: 150 },
            { width: '80%', delay: 300 },
            { width: '95%', delay: 600 },
        ];

        steps.forEach(({ width, delay }) => {
            setTimeout(() => {
                if (bar) bar.style.width = width;
            }, delay);
        });

        timerRef.current = setTimeout(() => {
            if (bar) {
                bar.style.width = '100%';
                setTimeout(() => {
                    if (bar) {
                        bar.style.opacity = '0';
                        setTimeout(() => {
                            if (bar) bar.style.width = '0%';
                        }, 200);
                    }
                }, 100);
            }
        }, 1200);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [pathname, searchParams]);

    return (
        <div
            ref={barRef}
            className="nprogress-bar"
            style={{ width: '0%', opacity: 0 }}
        />
    );
}
