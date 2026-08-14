"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf, ShoppingBag, Trees, Target, Trophy, Award, Loader2, ChevronRight } from "lucide-react";

const ICON_MAP: Record<string, any> = { leaf: Leaf, "shopping-bag": ShoppingBag, trees: Trees };

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => { if (d.challenges) setChallenges(d.challenges); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/buyer" className="p-2 rounded-lg hover:bg-white/50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Challenges</h1>
            <p className="text-sm text-gray-500">Every purchase brings us closer to our goals.</p>
          </div>
        </div>

        <div className="space-y-6">
          {challenges.map((c: any) => {
            const Icon = ICON_MAP[c.icon] || Target;
            const progress = Math.min(Math.round((c.current / c.target) * 100), 100);
            const deadline = new Date(c.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                      </div>
                      {c.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 shrink-0">
                          <Award className="w-3 h-3" /> {c.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">{c.current.toLocaleString()} / {c.target.toLocaleString()} {c.unit}</span>
                        <span className="font-bold text-[#2D5F3F]">{progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#2D5F3F] to-[#4a8f5e] rounded-full transition-all duration-1000" style={{ width: progress + "%" }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                      <span>Deadline: {deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <div className="text-center py-16">
            <Target className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No active challenges right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
