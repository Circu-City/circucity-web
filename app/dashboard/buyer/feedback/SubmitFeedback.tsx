"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitSellerFeedback } from "@/app/actions/feedback";

const FRICTION_POINTS = [
  { value: "search", label: "Search & Discovery" },
  { value: "checkout", label: "Checkout Process" },
  { value: "shipping", label: "Shipping & Delivery" },
  { value: "returns", label: "Returns & Refunds" },
  { value: "product-info", label: "Product Information" },
  { value: "pricing", label: "Pricing & Fees" },
  { value: "account", label: "Account & Profile" },
  { value: "other", label: "Other" },
];

export function SubmitFeedback({ userId, userFeedbackCount }: { userId: string; userFeedbackCount: number }) {
  const [feedbackType, setFeedbackType] = useState<"feature" | "problem">("feature");
  const [frictionPoint, setFrictionPoint] = useState("other");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError("");

    const result = await submitSellerFeedback({
      feedbackType,
      frictionPoint,
      satisfaction: null,
      comment: comment.trim(),
    });

    setSubmitting(false);

    if (result.success) {
      setDone(true);
      setComment("");
      setTimeout(() => setDone(false), 4000);
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Share Your Feedback</h2>
      <p className="text-sm text-gray-500 mb-4">
        {userFeedbackCount > 0
          ? `You've submitted ${userFeedbackCount} feedback so far. Thank you!`
          : "Help us improve CircuCity for everyone."}
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFeedbackType("feature")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${feedbackType === "feature" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"}`}
        >
          Feature Request
        </button>
        <button
          type="button"
          onClick={() => setFeedbackType("problem")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${feedbackType === "problem" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"}`}
        >
          Report Issue
        </button>
      </div>

      <select
        value={frictionPoint}
        onChange={e => setFrictionPoint(e.target.value)}
        className="w-full mb-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 focus:border-[#2D5F3F]"
      >
        {FRICTION_POINTS.map(fp => (
          <option key={fp.value} value={fp.value}>{fp.label}</option>
        ))}
      </select>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={feedbackType === "feature" ? "What feature would you like to see?" : "Describe the issue you encountered..."}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 focus:border-[#2D5F3F] resize-none"
      />

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <div className="flex items-center justify-between mt-3">
        {done ? (
          <span className="text-sm text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Feedback submitted!
          </span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="px-5 py-2 bg-[#2D5F3F] text-white rounded-xl text-sm font-medium hover:bg-[#234e33] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? "Sending..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
