"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf, ShoppingBag, Star, Zap, Crown, Trees,
  Droplets, Calendar, ArrowLeft, ChevronLeft, ChevronRight,
  Loader2, Sparkles, Heart
} from "lucide-react";

export default function SharedWrappedPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/wrapped/share/" + params.token)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else if (d.stats) setData(d);
        else setError("No wrapped data found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1428] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A1428] flex items-center justify-center p-4">
        <div className="text-center text-white/60">
          <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-lg">{error || "Wrapped not found"}</p>
          <p className="text-sm mt-2">This link may have expired.</p>
          <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm">Go to CircuCity</button>
        </div>
      </div>
    );
  }

  const { stats, year, name } = data;
  const totalSlides = 7;

  const slides = [
    { bg: "from-emerald-900/40 via-emerald-800/20 to-emerald-900/40", border: "border-emerald-500/30", icon: <Sparkles className="w-10 h-10 text-emerald-400" />, title: name, subtitle: `${year} CircuCity Wrapped` },
    { bg: "from-blue-900/40 via-blue-800/20 to-blue-900/40", border: "border-blue-500/30", icon: <ShoppingBag className="w-10 h-10 text-blue-400" />, title: `${stats.orders}`, subtitle: "Orders placed", extra: <p className="text-white/60 text-sm mt-4">{stats.totalSpent.toLocaleString()} kr total spent</p> },
    { bg: "from-green-900/40 via-green-800/20 to-green-900/40", border: "border-green-500/30", icon: <Leaf className="w-10 h-10 text-green-400" />, title: `${stats.co2Saved} kg`, subtitle: "CO₂ Saved", extra: <div className="grid grid-cols-2 gap-3 mt-4 max-w-xs mx-auto"><div className="bg-white/10 rounded-xl p-3"><Trees className="w-5 h-5 text-green-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{stats.treesEquivalent}</p><p className="text-[10px] text-white/60">Trees</p></div><div className="bg-white/10 rounded-xl p-3"><Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{stats.waterSaved}L</p><p className="text-[10px] text-white/60">Water</p></div></div> },
    { bg: "from-amber-900/40 via-amber-800/20 to-amber-900/40", border: "border-amber-500/30", icon: <Star className="w-10 h-10 text-amber-400" />, title: stats.topCategory, subtitle: "Most-shopped category" },
    { bg: "from-purple-900/40 via-purple-800/20 to-purple-900/40", border: "border-purple-500/30", icon: <Zap className="w-10 h-10 text-purple-400" />, title: `${stats.currentStreak}`, subtitle: "Day shopping streak" },
    { bg: "from-rose-900/40 via-rose-800/20 to-rose-900/40", border: "border-rose-500/30", icon: <Crown className="w-10 h-10 text-rose-400" />, title: `#${stats.leaderboardRank}`, subtitle: "Eco leaderboard rank" },
    { bg: "from-emerald-900/40 via-emerald-800/20 to-emerald-900/40", border: "border-emerald-500/30", icon: <Heart className="w-10 h-10 text-red-400" />, title: "Incredible!", subtitle: `${name} is making a real impact with every purchase.`, extra: <button onClick={() => router.push("/")} className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all">Join CircuCity</button> },
  ];

  const prev = () => setPage(p => Math.max(0, p - 1));
  const next = () => setPage(p => Math.min(totalSlides - 1, p + 1));

  return (
    <div className="min-h-screen bg-[#0A1428] flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className={`relative bg-gradient-to-b ${slides[page].bg} border ${slides[page].border} rounded-3xl shadow-2xl shadow-black/40 p-8 md:p-10 text-center min-h-[520px] flex flex-col items-center justify-center transition-all duration-500`}>
          <div className="mb-6">{slides[page].icon}</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{slides[page].title}</h1>
          <p className="text-lg text-white/80 max-w-sm">{slides[page].subtitle}</p>
          {slides[page].extra}
          {page > 0 && <div className="absolute inset-y-0 left-0 flex items-center"><button onClick={prev} className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><ChevronLeft className="w-5 h-5" /></button></div>}
          {page < totalSlides - 1 && <div className="absolute inset-y-0 right-0 flex items-center"><button onClick={next} className="mr-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><ChevronRight className="w-5 h-5" /></button></div>}
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-8 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs text-center mt-4">Slide {page + 1} of {totalSlides}</p>
      </div>
    </div>
  );
}
