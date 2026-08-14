"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf, ShoppingBag, Award, TrendingUp, Zap, Star, Trees,
  Droplets, Crown, Calendar, ArrowLeft, Share2, ChevronLeft, ChevronRight,
  Loader2, Sparkles, Heart, CheckCircle2, Co2
} from "lucide-react";

export default function WrappedPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/wrapped")
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const generateShareLink = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/wrapped/share", { method: "POST" });
      const d = await res.json();
      if (d.url) {
        setShareUrl(d.url);
        await navigator.clipboard.writeText(d.url);
        setTimeout(() => setShareUrl(""), 3000);
      }
    } catch {}
    setSharing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1428] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#A3E635] mx-auto" />
          <p className="text-white/60 mt-4 text-sm">Crunching your impact data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A1428] flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-lg">No data available yet.</p>
          <p className="text-sm mt-2">Start shopping to see your yearly impact!</p>
          <button onClick={() => router.push("/products")} className="mt-4 px-6 py-2 bg-[#A3E635] text-[#0A1428] rounded-xl font-bold text-sm">Browse Products</button>
        </div>
      </div>
    );
  }

  const { stats, year, name } = data;
  const totalSlides = 7;

  const slides = [
    {
      bg: "from-emerald-900/40 via-emerald-800/20 to-emerald-900/40",
      border: "border-emerald-500/30",
      icon: <Sparkles className="w-10 h-10 text-emerald-400" />,
      title: `${name}`,
      subtitle: `Your ${year} CircuCity Wrapped`,
      extra: (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"><Calendar className="w-3 h-3 inline mr-1" />{year}</span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"><Heart className="w-3 h-3 inline mr-1" />Sustainable Shopper</span>
        </div>
      ),
    },
    {
      bg: "from-blue-900/40 via-blue-800/20 to-blue-900/40",
      border: "border-blue-500/30",
      icon: <ShoppingBag className="w-10 h-10 text-blue-400" />,
      title: `${stats.orders}`,
      subtitle: "Orders placed this year",
      extra: <p className="text-white/60 text-sm mt-4">{stats.totalSpent.toLocaleString()} kr total spent across {stats.itemsPurchased} items</p>,
    },
    {
      bg: "from-green-900/40 via-green-800/20 to-green-900/40",
      border: "border-green-500/30",
      icon: <Leaf className="w-10 h-10 text-green-400" />,
      title: `${stats.co2Saved} kg`,
      subtitle: "CO₂ Saved",
      extra: (
        <div className="grid grid-cols-2 gap-3 mt-4 max-w-xs mx-auto">
          <div className="bg-white/10 rounded-xl p-3">
            <Trees className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.treesEquivalent}</p>
            <p className="text-[10px] text-white/60">Trees Equivalent</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.waterSaved}L</p>
            <p className="text-[10px] text-white/60">Water Saved</p>
          </div>
        </div>
      ),
    },
    {
      bg: "from-amber-900/40 via-amber-800/20 to-amber-900/40",
      border: "border-amber-500/30",
      icon: <Star className="w-10 h-10 text-amber-400" />,
      title: stats.topCategory,
      subtitle: "Most-shopped category",
      extra: <p className="text-white/60 text-sm mt-4">{stats.itemsPurchased} items purchased this year</p>,
    },
    {
      bg: "from-purple-900/40 via-purple-800/20 to-purple-900/40",
      border: "border-purple-500/30",
      icon: <Zap className="w-10 h-10 text-purple-400" />,
      title: `${stats.currentStreak}`,
      subtitle: "Day shopping streak",
      extra: <p className="text-white/60 text-sm mt-4">{stats.ecoPoints.toLocaleString()} eco tokens earned</p>,
    },
    {
      bg: "from-rose-900/40 via-rose-800/20 to-rose-900/40",
      border: "border-rose-500/30",
      icon: <Crown className="w-10 h-10 text-rose-400" />,
      title: `#${stats.leaderboardRank}`,
      subtitle: "Your eco leaderboard rank",
      extra: (
        <div className="mt-4">
          <div className="bg-white/10 rounded-xl p-4 max-w-xs mx-auto">
            <p className="text-sm text-white/80">Total CO₂ saved by all shoppers</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.totalPlatformCo2.toLocaleString()} kg</p>
          </div>
        </div>
      ),
    },
    {
      bg: "from-emerald-900/40 via-emerald-800/20 to-emerald-900/40",
      border: "border-emerald-500/30",
      icon: <Heart className="w-10 h-10 text-red-400" />,
      title: "Thank you!",
      subtitle: "Every purchase makes a difference.",
      extra: (
        <div className="mt-6 space-y-3">
          <button onClick={generateShareLink} disabled={sharing} className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50">
            {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : shareUrl ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {sharing ? "Generating..." : shareUrl ? "Link copied!" : "Share Your Wrapped"}
          </button>
          {shareUrl && (
            <p className="text-[10px] text-white/40 text-center break-all max-w-xs mx-auto">{shareUrl}</p>
          )}
          <button onClick={() => router.push("/dashboard/buyer")} className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-white/10 text-white/80 rounded-xl font-bold hover:bg-white/20 transition-all text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      ),
    },
  ];

  const prev = () => setPage(p => Math.max(0, p - 1));
  const next = () => setPage(p => Math.min(totalSlides - 1, p + 1));

  return (
    <div className="min-h-screen bg-[#0A1428] flex items-center justify-center p-4" ref={reportRef}>
      <div className="w-full max-w-lg mx-auto">
        {/* Card */}
        <div className={`relative bg-gradient-to-b ${slides[page].bg} border ${slides[page].border} rounded-3xl shadow-2xl shadow-black/40 p-8 md:p-10 text-center min-h-[520px] flex flex-col items-center justify-center transition-all duration-500`}>
          <div className="mb-6">{slides[page].icon}</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{slides[page].title}</h1>
          <p className="text-lg text-white/80 max-w-sm">{slides[page].subtitle}</p>
          {slides[page].extra}

          {/* Arrow nav */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            {page > 0 && (
              <button onClick={prev} className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            {page < totalSlides - 1 && (
              <button onClick={next} className="mr-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-8 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs text-center mt-4">Slide {page + 1} of {totalSlides}</p>
      </div>
    </div>
  );
}
