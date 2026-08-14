'use client';

import { useEffect, useState } from 'react';
import { Users, Leaf, Award } from 'lucide-react';

export function ImpactStats() {
    const [stats, setStats] = useState({ users: 0, totalCo2Saved: 0, totalEcoPoints: 0 });

    useEffect(() => {
        fetch('/api/impact-stats')
            .then((r) => r.json())
            .then(setStats)
            .catch(() => {});
    }, []);

    return (
        <section className="relative overflow-hidden py-12 px-4 bg-white">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] w-[600px] h-[600px] opacity-10 pointer-events-none">
                <div className="w-full h-full text-[#2D5F3F]">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full animate-spin" style={{ animationDuration: '18s', transform: 'rotate(305.82deg)' }}>
                        <circle cx="50" cy="50" r="48" />
                        <ellipse cx="50" cy="50" rx="48" ry="15" />
                        <ellipse cx="50" cy="50" rx="48" ry="30" />
                        <ellipse cx="50" cy="50" rx="48" ry="45" />
                        <ellipse cx="50" cy="50" rx="15" ry="48" />
                        <ellipse cx="50" cy="50" rx="30" ry="48" />
                        <ellipse cx="50" cy="50" rx="45" ry="48" />
                        <ellipse cx="50" cy="50" rx="48" ry="22" transform="rotate(45 50 50)" />
                        <ellipse cx="50" cy="50" rx="22" ry="48" transform="rotate(45 50 50)" />
                        <ellipse cx="50" cy="50" rx="48" ry="22" transform="rotate(135 50 50)" />
                        <ellipse cx="50" cy="50" rx="22" ry="48" transform="rotate(135 50 50)" />
                    </svg>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4D35E]/20 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf w-5 h-5 text-[#2D5F3F]">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                    <span className="text-sm text-[#2D5F3F]">Live Impact</span>
                </div>
                <h2 className="text-4xl mb-4">Global CO₂ Saved</h2>
                <div className="text-6xl md:text-8xl text-[#2D5F3F] mb-4 tabular-nums">
                    {stats.totalCo2Saved.toLocaleString()} kg
                </div>
                <p className="text-gray-600">Together, our community has made a real environmental impact</p>
            </div>
        </section>
    );
}
