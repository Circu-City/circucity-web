"use client";

import { useState } from "react";
import useSWR from "swr";
import { Trophy, Zap, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import LeaderboardTable, { LeaderboardEntry } from "@/components/leaderboard/LeaderboardTable";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardPage() {
    const [timeframe, setTimeframe] = useState<"Weekly" | "Monthly" | "All-time">("Monthly");
    // We'll keep these in state but we can hide the UI for them right now if we want to match the design exactly,
    // or keep them for functionality. Let's assume we are fetching based on totalCo2Saved to match the design's "CO2 Saved" focus,
    // but we can still allow toggles if needed. We'll simplify the data fetching to just use the existing API.
    const type = "users";
    const metric = "totalCo2Saved";

    // Poll every 5 seconds for real-time gamification feel
    const { data, error, isLoading } = useSWR<LeaderboardEntry[]>(
        `/api/leaderboard?type=${type}&metric=${metric}&timeframe=${timeframe.toLowerCase()}`,
        fetcher,
        { refreshInterval: 5000 }
    );

    const safeData = (data || []).map((entry) => ({
        ...entry,
        totalCo2Saved: Number(entry.totalCo2Saved) || 0,
        ecoPoints: Number(entry.ecoPoints) || 0,
    }));
    const top3 = safeData.slice(0, 3);
    const restOfUsers = safeData.slice(3);

    return (
        <div className="min-h-screen bg-[#f5f0e6]">
            {/* Header Section */}
            <section className="bg-gradient-to-b from-[#2d5f3f] to-[#1a3a28] pt-12 md:pt-16 pb-16 md:pb-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-[rgba(244,211,94,0.2)] text-[#F4D35E] px-3 md:px-4 py-2 rounded-full mb-4 md:mb-6">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm font-semibold">Community Leaderboard</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-bold mb-3 md:mb-4">
                        Top Eco Warriors
                    </h1>
                    <p className="text-sm md:text-lg lg:text-xl text-[#e5e7eb] max-w-2xl mx-auto px-4">
                        Celebrate the community members making the biggest impact on our planet. Join the movement and climb the ranks!
                    </p>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="-mt-12 md:-mt-16 py-6 md:py-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    {/* Timeframe Toggles */}
                    <div className="flex justify-center mb-8 md:mb-12">
                        <div className="flex items-center bg-white/60 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-sm border border-white">
                            {["Weekly", "Monthly", "All-time"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t as any)}
                                    className={`relative px-6 md:px-10 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 outline-none ${timeframe === t
                                        ? "text-white"
                                        : "text-[#4a5565] hover:text-[#2d5f3f]"
                                        }`}
                                >
                                    {timeframe === t && (
                                        <motion.div
                                            layoutId="active-timeframe-pill"
                                            className="absolute inset-0 bg-[#2d5f3f] rounded-full shadow-md"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading && (
                        <div className="w-full flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5f3f]"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-500 py-8 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
                            <p>Failed to load leaderboard data. Please try again later.</p>
                        </div>
                    )}

                    {!isLoading && !error && safeData.length > 0 && (
                        <>
                            {/* Podium for Top 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 items-end">

                                {/* 2nd Place */}
                                {top3[1] && (
                                    <div className="order-2 md:order-1 bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6 text-center relative h-[320px] flex flex-col justify-end">
                                        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-[#d1d5db] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
                                            2
                                        </div>
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4">
                                            <Image
                                                src={top3[1].image || top3[1].logo || "/placeholder-avatar.png"}
                                                alt={top3[1].name || "User"}
                                                fill
                                                className="rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                                            />
                                            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#d1d5db] w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                                                <Trophy className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm md:text-lg font-bold text-[#1e2939] mb-1 truncate px-2">{top3[1].name || "Eco-Warrior"}</h3>
                                        <p className="text-xs md:text-sm text-[#2d5f3f] mb-3 md:mb-4 px-1 truncate">Sustainability Champion</p>
                                        <div className="bg-[#f0fdf4] rounded-xl md:rounded-2xl p-2 md:p-3 mt-auto">
                                            <p className="text-[10px] md:text-xs text-[#4a5565] mb-0.5 md:mb-1 uppercase tracking-wider font-semibold">CO₂ Saved</p>
                                            <p className="text-lg md:text-xl font-bold text-[#2d5f3f] truncate">{top3[1].totalCo2Saved.toFixed(1)}<span className="text-xs font-normal">kg</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* 1st Place */}
                                {top3[0] && (
                                    <div className="order-1 md:order-2 bg-gradient-to-b from-[#F4D35E] to-[#f0c84e] rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 text-center relative md:transform md:scale-110 h-[360px] flex flex-col justify-end z-10">
                                        <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-[#F4D35E] text-[#2d5f3f] w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl md:text-2xl shadow-xl border-4 border-white">
                                            1
                                        </div>
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-3 md:mb-4">
                                            <Image
                                                src={top3[0].image || top3[0].logo || "/placeholder-avatar.png"}
                                                alt={top3[0].name || "User"}
                                                fill
                                                className="rounded-full object-cover border-4 border-white shadow-xl bg-gray-100"
                                            />
                                            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[#F4D35E] w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                                                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#2d5f3f]" />
                                            </div>
                                        </div>
                                        <h3 className="text-base md:text-xl font-bold text-[#1e2939] mb-1 truncate px-2">{top3[0].name || "Eco-Warrior"}</h3>
                                        <p className="text-xs md:text-sm text-[#2d5f3f] mb-2 md:mb-3 px-1 truncate">Eco Warrior</p>
                                        <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-3 mt-auto w-full">
                                            <p className="text-[10px] md:text-xs text-[#4a5565] mb-0.5 md:mb-1 uppercase tracking-wider font-semibold">CO₂ Saved</p>
                                            <p className="text-xl md:text-2xl font-bold text-[#2d5f3f] truncate">{top3[0].totalCo2Saved.toFixed(1)}<span className="text-sm font-normal">kg</span></p>
                                        </div>
                                        <div className="mt-2 md:mt-3 flex items-center justify-center gap-1 md:gap-2 bg-[rgba(45,95,63,0.1)] rounded-full px-2 md:px-3 py-1 md:py-1.5 w-full mx-auto">
                                            <Trophy className="w-3 h-3 text-[#2d5f3f]" />
                                            <span className="text-[10px] md:text-xs text-[#2d5f3f] font-semibold truncate">{top3[0].ecoPoints} Tokens</span>
                                        </div>
                                    </div>
                                )}

                                {/* 3rd Place */}
                                {top3[2] && (
                                    <div className="order-3 bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6 text-center relative h-[320px] flex flex-col justify-end">
                                        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
                                            3
                                        </div>
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4">
                                            <Image
                                                src={top3[2].image || top3[2].logo || "/placeholder-avatar.png"}
                                                alt={top3[2].name || "User"}
                                                fill
                                                className="rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                                            />
                                            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#f59e0b] w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                                                <Trophy className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm md:text-lg font-bold text-[#1e2939] mb-1 truncate px-2">{top3[2].name || "Eco-Warrior"}</h3>
                                        <p className="text-xs md:text-sm text-[#2d5f3f] mb-3 md:mb-4 px-1 truncate">Green Guardian</p>
                                        <div className="bg-[#f0fdf4] rounded-xl md:rounded-2xl p-2 md:p-3 mt-auto">
                                            <p className="text-[10px] md:text-xs text-[#4a5565] mb-0.5 md:mb-1 uppercase tracking-wider font-semibold">CO₂ Saved</p>
                                            <p className="text-lg md:text-xl font-bold text-[#2d5f3f] truncate">{top3[2].totalCo2Saved.toFixed(1)}<span className="text-xs font-normal">kg</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rest of the Leaderboard Table */}
                            {restOfUsers.length > 0 && (
                                <LeaderboardTable data={restOfUsers} metric={metric} startIndex={3} />
                            )}

                            {/* Personal Ranking Widget overlay logic could go here, omitting for breavity of dynamic data */}
                        </>
                    )}

                    {!isLoading && safeData.length === 0 && !error && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto p-12">
                            <Leaf className="w-16 h-16 mx-auto mb-4 text-[#2d5f3f] opacity-50" />
                            <h3 className="text-2xl font-bold text-[#1e2939] mb-2">No data yet</h3>
                            <p className="text-gray-500">Be the first to start making an impact and claim the #1 spot!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
