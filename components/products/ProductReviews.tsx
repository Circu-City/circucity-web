"use client";

import { useState, useEffect } from "react";
import { Star, Send, User } from "lucide-react";
import { toast } from "sonner";

interface Review { id: string; rating: number; comment: string; user: { name: string }; createdAt: string; }

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const submitReview = async () => {
    if (!comment.trim()) { toast.error("Please write a review"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => [data.review, ...prev]);
        setComment("");
        setRating(5);
        toast.success(data.tokenMessage || "Review submitted! +50 tokens");
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>

      {/* Review Form */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Your Rating:</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                className={`transition-colors ${s <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                <Star className="w-5 h-5" fill={s <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          placeholder="Share your thoughts about this product..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm resize-none mb-3" />
        <button onClick={submitReview} disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D5F3F] text-white rounded-xl font-bold text-sm hover:bg-[#1a3a28] disabled:opacity-50">
          <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review (+50 tokens)'}
        </button>
      </div>

      {/* Existing Reviews */}
      {loading ? (
        <div className="text-center py-4 text-sm text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400">No reviews yet. Be the first to review!</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-sm text-gray-900">{r.user?.name || 'Anonymous'}</span>
                <div className="flex gap-0.5 ml-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
