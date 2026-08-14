"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, Loader2, CheckCircle, Vote as VoteIcon } from "lucide-react";

export default function VotingPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const fetchTopics = () => {
    setLoading(true);
    fetch("/api/voting")
      .then((r) => r.json())
      .then((d) => { if (d.topics) setTopics(d.topics); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleVote = async (topicId: string, choice: string) => {
    setVoting(topicId);
    try {
      const res = await fetch("/api/voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, choice }),
      });
      if (res.ok) fetchTopics();
    } catch {}
    setVoting(null);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Community Voting</h1>
            <p className="text-sm text-gray-500">Your voice shapes CircuCity.</p>
          </div>
        </div>

        <div className="space-y-6">
          {topics.map((topic: any) => {
            const total = topic.totalVotes || 0;
            const hasVoted = !!topic.userVote;

            return (
              <div key={topic.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white shrink-0">
                    <VoteIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{topic.title}</h3>
                    <p className="text-sm text-gray-500">{topic.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {total} vote{total !== 1 ? "s" : ""}
                  </span>
                </div>

                {hasVoted ? (
                  <div className="space-y-2">
                    {topic.options.map((opt: string) => {
                      const count = topic.results?.[opt] || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isUserChoice = topic.userVote === opt;
                      return (
                        <div key={opt} className={"p-3 rounded-xl border " + (isUserChoice ? "bg-emerald-50 border-emerald-300" : "bg-gray-50 border-gray-100")}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium flex items-center gap-1">
                              {opt}
                              {isUserChoice && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            </span>
                            <span className="text-sm font-bold text-gray-700">{pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#2D5F3F] to-[#4a8f5e] rounded-full" style={{ width: pct + "%" }} />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-emerald-600 font-medium mt-2">You voted: {topic.userVote}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {topic.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => handleVote(topic.id, opt)}
                        disabled={voting === topic.id}
                        className="p-3 rounded-xl border border-gray-200 hover:border-[#2D5F3F] hover:bg-green-50 text-sm font-medium text-gray-700 transition-all disabled:opacity-50"
                      >
                        {voting === topic.id ? "..." : opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
