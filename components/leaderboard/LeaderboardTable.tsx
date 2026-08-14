"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";
import { Trophy, Leaf, Medal, Zap } from "lucide-react";

export type LeaderboardEntry = {
    id: string;
    name: string | null;
    image?: string | null;
    logo?: string | null;
    ecoPoints: number;
    totalCo2Saved: number;
};

interface LeaderboardTableProps {
    data: LeaderboardEntry[];
    metric: "ecoPoints" | "totalCo2Saved";
    startIndex?: number;
    isLoading?: boolean;
}

export default function LeaderboardTable({ data, metric, startIndex = 0, isLoading = false }: LeaderboardTableProps) {
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

    useEffect(() => {
        // Only trigger confetti if we are rendering the very top of the list (startIndex === 0)
        if (!isLoading && data.length > 0 && startIndex === 0 && !hasTriggeredConfetti) {
            triggerConfetti();
            setHasTriggeredConfetti(true);
        }
    }, [data, isLoading, startIndex, hasTriggeredConfetti]);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                })
            );
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                })
            );
        }, 250);
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5F3F]"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No data available yet. Be the first to start making an impact!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0a0a0a] mb-4 md:mb-6">
                {startIndex > 0 ? "Runner Ups" : "Leaderboard"}
            </h2>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3">
                <AnimatePresence>
                    {data.map((entry, idx) => {
                        const rank = startIndex + idx + 1;
                        const avatarUrl = entry.image || entry.logo || "/placeholder-avatar.png";
                        return (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="bg-[#f5f0e6] hover:bg-[#efede6] transition-colors rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-[#2d5f3f]">#{rank}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white">
                                                {avatarUrl !== "/placeholder-avatar.png" ? (
                                                    <Image src={avatarUrl} alt={entry.name || "User"} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#2d5f3f] text-white text-xs font-bold">
                                                        {(entry.name || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#101828] truncate max-w-[120px]">
                                                    {entry.name || "Eco-Warrior"}
                                                </p>
                                                <p className="text-xs text-[#6a7282]">Contributor</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 bg-[#fef3c7] text-[#f59e0b] px-2 py-1 rounded-full text-xs font-semibold">
                                        <Zap className="w-3 h-3" />
                                        Active
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-[#6a7282] mb-1">CO₂ Saved</p>
                                        <p className="text-sm font-semibold text-[#2d5f3f]">{entry.totalCo2Saved.toFixed(1)}kg</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6a7282] mb-1">Eco Tokens</p>
                                        <p className="text-sm font-semibold text-[#0a0a0a]">{entry.ecoPoints.toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#e5e7eb]">
                            <th className="text-left py-4 px-4 text-xs md:text-sm font-semibold text-[#6a7282]">RANK</th>
                            <th className="text-left py-4 px-4 text-xs md:text-sm font-semibold text-[#6a7282]">USER</th>
                            <th className="text-left py-4 px-4 text-xs md:text-sm font-semibold text-[#6a7282]">CO₂ SAVED</th>
                            <th className="text-left py-4 px-4 text-xs md:text-sm font-semibold text-[#6a7282]">ECO TOKENS</th>
                            <th className="text-left py-4 px-4 text-xs md:text-sm font-semibold text-[#6a7282]">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {data.map((entry, idx) => {
                                const rank = startIndex + idx + 1;
                                const avatarUrl = entry.image || entry.logo || "/placeholder-avatar.png";

                                return (
                                    <motion.tr
                                        key={entry.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        className="border-b border-[#f3f4f6] hover:bg-[#f5f0e6] transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-[#0a0a0a]">#{rank}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white">
                                                    {avatarUrl !== "/placeholder-avatar.png" ? (
                                                        <Image src={avatarUrl} alt={entry.name || "User"} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#2d5f3f] text-white text-xs font-bold">
                                                            {(entry.name || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#101828]">{entry.name || "Eco-Warrior"}</p>
                                                    <p className="text-xs text-[#6a7282]">Contributor</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-[#2d5f3f]" />
                                                <span className="text-sm text-[#2d5f3f] font-semibold">{entry.totalCo2Saved.toFixed(1)}kg</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-[#0a0a0a] font-medium">{entry.ecoPoints.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1 bg-[#fef3c7] text-[#f59e0b] px-3 py-1 rounded-full text-xs font-semibold">
                                                <Zap className="w-3 h-3" />
                                                Active
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
