import Link from "next/link";
import { ArrowLeft, MessageSquare, Lightbulb, CheckCircle2, HeartHandshake, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SubmitFeedback } from "./SubmitFeedback";

export default async function FeedbackLoopPage() {
  const { userId } = await auth();

  const [recentFeedback, totalFeedback, featureRequests, problems, trendingTopics] = await Promise.all([
    prisma.sellerFeedback.findMany({
      where: { isRead: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.sellerFeedback.count(),
    prisma.sellerFeedback.count({ where: { feedbackType: "feature" } }),
    prisma.sellerFeedback.count({ where: { feedbackType: "problem" } }),
    prisma.sellerFeedback.groupBy({
      by: ["frictionPoint", "feedbackType"],
      _count: true,
      orderBy: { _count: { frictionPoint: "desc" } },
      take: 8,
    }),
  ]);

  const userFeedbackCount = userId ? await prisma.sellerFeedback.count({ where: { userId } }) : 0;

  const hasContent = recentFeedback.length > 0 || trendingTopics.some(t => t.frictionPoint);

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/buyer" className="p-2 rounded-lg hover:bg-white/50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">You Spoke. We Listened.</h1>
            <p className="text-sm text-gray-500">Every piece of feedback helps shape CircuCity.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
            <p className="text-sm text-gray-500">Total Feedback</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <Lightbulb className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{featureRequests}</p>
            <p className="text-sm text-gray-500">Feature Requests</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{problems}</p>
            <p className="text-sm text-gray-500">Issues Reported</p>
          </div>
        </div>

        {userId && <SubmitFeedback userId={userId} userFeedbackCount={userFeedbackCount} />}

        {trendingTopics.filter(t => t.frictionPoint).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D5F3F]" /> Trending Topics
            </h2>
            <div className="space-y-3">
              {trendingTopics.filter(t => t.frictionPoint).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.feedbackType === "feature" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                      {t.feedbackType === "feature" ? "Request" : "Issue"}
                    </span>
                    <span className="text-sm font-medium text-gray-700 capitalize">{t.frictionPoint.replace(/-/g, " ")}</span>
                  </div>
                  <span className="text-sm font-bold text-[#2D5F3F]">{t._count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentFeedback.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Community Feedback</h2>
            <div className="space-y-3">
              {recentFeedback.map((f: any) => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${f.feedbackType === "feature" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                    {f.feedbackType === "feature" ? "Request" : "Issue"}
                  </span>
                  <p className="text-sm text-gray-700 flex-1">{f.comment || "No details"}</p>
                  <span className="text-[10px] text-gray-400">{new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasContent && (
          <div className="text-center py-16">
            <HeartHandshake className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No feedback yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
