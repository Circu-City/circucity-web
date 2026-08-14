'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
    productId: string;
}

export function ViewTracker({ productId }: ViewTrackerProps) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;

        async function trackView() {
            try {
                await fetch('/api/analytics/view', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId }),
                });
                hasTracked.current = true;
            } catch (error) {
                console.error('Failed to track view:', error);
            }
        }

        // Delay slightly to ensure meaningful view? Or immediate.
        // Immediate for now.
        trackView();
    }, [productId]);

    return null; // Render nothing
}
