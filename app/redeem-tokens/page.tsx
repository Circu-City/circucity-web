"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, Award, Gift, Leaf, Star, ShoppingBag, Users, Share2, CalendarCheck,
  TrendingUp, Recycle, Medal, CheckCircle2, Lock, ArrowRight, Clock,
  MessageSquare, UserPlus,
} from "lucide-react";
import { toast } from "sonner";

interface BadgeItem { id: string; name: string; icon: any; unlocked: boolean; }
interface Reward { name: string; cost: number; icon: any; locked: boolean; }

const EARN_METHODS = [
  { icon: ShoppingBag, title: 'Make a Purchase', desc: '10 tokens per 1 kr spent', action: '/products' },
  { icon: MessageSquare, title: 'Write a Review', desc: '50 tokens per review', action: '/dashboard/orders' },
  { icon: UserPlus, title: 'Refer a Friend', desc: '500 tokens per referral', action: 'referral' },
  { icon: CalendarCheck, title: 'Daily Login', desc: '10 tokens each day', action: null },
  { icon: Share2, title: 'Share on Social', desc: '25 tokens per share', action: 'share' },
];

const REWARDS: Reward[] = [
  { name: '5 kr Off Next Order', cost: 500, icon: Gift, locked: false },
  { name: 'Free Shipping', cost: 750, icon: Gift, locked: false },
  { name: '10 kr Off Next Order', cost: 1000, icon: Gift, locked: false },
  { name: 'Exclusive Product Access', cost: 1500, icon: Lock, locked: true },
  { name: '25 kr Gift Card', cost: 2500, icon: Lock, locked: true },
  { name: 'Plant a Real Tree', cost: 5000, icon: Lock, locked: true },
];

export default function RedeemTokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [memberSince, setMemberSince] = useState("—");
  const [userName, setUserName] = useState("");
  const [firstOrderDate, setFirstOrderDate] = useState<string | null>(null);
  const [referralUrl, setReferralUrl] = useState("");
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralUrl(`https://circucity.com/sign-up?ref=${userId || 'user'}`);
    }
  }, [userId]);

  const handleReferral = () => {
    setShowReferral(!showReferral);
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl).then(() => toast.success("Referral link copied!")).catch(() => {});
    }
  };

  const handleShare = async (platform: string) => {
    const text = "I'm earning Eco Tokens on CircuCity — the sustainable marketplace! Join me 🌍";
    const url = "https://circucity.com";
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
    else if (platform === 'copy') { navigator.clipboard.writeText(`${text} ${url}`).then(() => toast.success("Link copied! Share it anywhere.")); }

    try {
      const res = await fetch("/api/earn-tokens", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
      const data = await res.json();
      if (data.bonusAwarded) {
        setEcoPoints(data.ecoPoints);
        toast.success(`+${data.bonus} tokens for sharing!`);
      }
    } catch { /* silently ignore share reward failures */ }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
      fetch("/api/dashboard/overview", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
      fetch("/api/leaderboard?type=users&metric=ecoPoints", { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch("/api/earn-tokens", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login" }) }).then(r => r.json()).catch(() => ({})),
    ]).then(([me, overview, lb]) => {
      const orders = overview.stats?.totalOrders || overview.totalOrders || 0;
      const spent = overview.stats?.totalSpent || overview.totalSpent || 0;
      const pts = me.ecoPoints || me.user?.ecoPoints || 0;
      const co2 = me.totalCo2Saved || me.user?.totalCo2Saved || 0;
      const joined = me.createdAt || me.user?.createdAt || null;

      setEcoPoints(Number(pts) > 0 ? Number(pts) : Math.round(spent * 10));
      setCo2Saved(Number(co2));
      setTotalOrders(orders || 0);
      setReviewCount(overview.reviewCount || 0);
      setUserId(me.id || me.user?.id || "");
      setUserName(me.name || me.user?.name || "");
      setMemberSince(joined ? new Date(joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—');
      setLeaderboard(Array.isArray(lb) ? lb.slice(0, 5) : []);
      setFirstOrderDate(overview.firstOrderDate || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (reward.locked || ecoPoints < reward.cost) return;
    if (!confirm(`Redeem ${reward.cost.toLocaleString()} tokens for "${reward.name}"?`)) return;
    try {
      const res = await fetch("/api/redeem-tokens", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward: reward.name, cost: reward.cost }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEcoPoints(data.ecoPoints);
        toast.success(`Redeemed "${reward.name}"!`);
      } else {
        toast.error(data.error || "Failed to redeem. Contact support.");
      }
    } catch { toast.error("Failed to redeem"); }
  };

  const progress = Math.min(Math.round((ecoPoints / 2000) * 100), 100);
  const earnedBadges = 2 + (totalOrders >= 1 ? 1 : 0) + (reviewCount >= 5 ? 1 : 0) + (ecoPoints >= 500 ? 1 : 0);

  const badges: BadgeItem[] = [
    { id: 'first_purchase', name: 'First Purchase', icon: ShoppingBag, unlocked: totalOrders >= 1 },
    { id: 'tree_planter', name: 'Tree Planter', icon: Leaf, unlocked: co2Saved >= 10 },
    { id: 'eco_warrior', name: 'Eco Warrior', icon: Award, unlocked: ecoPoints >= 500 },
    { id: 'review_master', name: 'Review Master', icon: Star, unlocked: reviewCount >= 5 },
    { id: 'streak_hero', name: 'Streak Hero', icon: Zap, unlocked: false },
    { id: 'referral_king', name: 'Referral King', icon: Medal, unlocked: false },
    { id: 'green_champion', name: 'Green Champion', icon: Leaf, unlocked: totalOrders >= 50 },
    { id: 'planet_saver', name: 'Planet Saver', icon: Recycle, unlocked: co2Saved >= 100 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-2 border-[#2D5F3F] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-[#2D5F3F]">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Eco Tokens</span>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 rounded-2xl border-2 border-yellow-300 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><Zap className="w-6 h-6 text-yellow-600" /><span className="text-sm font-medium text-yellow-700">Your Balance</span></div>
              <p className="text-5xl font-bold text-gray-900">{ecoPoints.toLocaleString()}</p>
              <p className="text-gray-600 mt-1">Eco Tokens</p>
              <div className="flex gap-3 mt-4">
                <Link href="/products" className="px-6 py-2.5 bg-[#2D5F3F] text-white rounded-xl font-bold text-sm hover:bg-[#1a3a28] transition-colors">Earn More</Link>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-medium text-gray-600 mb-2">Next Milestone</p>
              <p className="text-lg font-bold text-gray-900">2,000 Tokens</p>
              <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: `${progress}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1">{progress}% · {Math.max(2000 - ecoPoints, 0)} more to unlock</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#2D5F3F]" /> How to Earn</h2>
              <div className="space-y-3">
                {EARN_METHODS.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center"><m.icon className="w-5 h-5 text-[#2D5F3F]" /></div>
                    <div className="flex-1"><p className="font-semibold text-gray-900 text-sm">{m.title}</p><p className="text-xs text-gray-500">{m.desc}</p></div>
                    {m.action === 'referral' ? (
                      <button onClick={handleReferral} className="text-xs text-[#2D5F3F] font-medium hover:underline whitespace-nowrap">
                        {showReferral ? 'Hide Link' : 'Get Link'}
                      </button>
                    ) : m.action === 'share' ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleShare('twitter')} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Share on Twitter/X"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                        <button onClick={() => handleShare('facebook')} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Share on Facebook"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                        <button onClick={() => handleShare('copy')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Copy link"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                      </div>
                    ) : m.action ? (
                      <Link href={m.action} className="text-xs text-[#2D5F3F] font-medium hover:underline"><ArrowRight className="w-4 h-4" /></Link>
                    ) : null}
                  </div>
                ))}
                {showReferral && referralUrl && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs font-medium text-green-800 mb-2">Your referral link — share with friends:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-green-200 truncate">{referralUrl}</code>
                      <button onClick={handleReferral} className="px-3 py-2 bg-[#2D5F3F] text-white text-xs font-bold rounded-lg hover:bg-[#1a3a28]">Copy</button>
                    </div>
                    <p className="text-[10px] text-green-600 mt-2">You'll earn 500 tokens when they sign up and make their first purchase!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-yellow-600" /> Redeem Rewards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {REWARDS.map((r, i) => (
                  <div key={i} className={`rounded-xl border p-4 text-center ${r.locked ? 'bg-gray-50 border-gray-100 opacity-50' : 'bg-white border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all'}`}>
                    <r.icon className={`w-8 h-8 mx-auto mb-2 ${r.locked ? 'text-gray-300' : 'text-yellow-600'}`} />
                    <p className="text-sm font-bold text-gray-900 mb-1">{r.name}</p>
                    <p className="text-xs font-medium text-[#2D5F3F] mb-2">{r.cost.toLocaleString()} tokens</p>
                    <button onClick={() => handleRedeem(r)}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                        r.locked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                        ecoPoints >= r.cost ? 'bg-[#2D5F3F] text-white hover:bg-[#1a3a28]' :
                        'bg-gray-100 text-gray-500'
                      }`} disabled={r.locked || ecoPoints < r.cost}>
                      {r.locked ? 'Locked' : ecoPoints >= r.cost ? 'Redeem' : `${r.cost - ecoPoints} more`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-[#2D5F3F]" /> Your Eco Journey</h2>
              <div className="space-y-4">
                {[
                  { date: memberSince, title: 'Joined as Eco Warrior', desc: 'Started your sustainable journey with CircuCity', unlocked: true },
                  { date: firstOrderDate ? new Date(firstOrderDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', title: 'First Purchase', desc: '10 tokens per 1 kr + First Purchase badge', unlocked: totalOrders >= 1 },
                  { date: reviewCount >= 5 ? 'Achieved!' : '—', title: '5 Reviews Written', desc: '50 tokens each · Review Master badge', unlocked: reviewCount >= 5 },
                  { date: ecoPoints >= 500 ? 'Achieved!' : `${2000 - ecoPoints} tokens to go`, title: 'Eco Milestone: 500 Tokens', desc: 'Eco Warrior badge unlocked', unlocked: ecoPoints >= 500 },
                  { date: ecoPoints >= 2000 ? 'Achieved!' : `${2000 - ecoPoints} tokens to go`, title: 'Eco Champion: 2,000 Tokens', desc: 'Unlock exclusive rewards', unlocked: ecoPoints >= 2000 },
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${event.unlocked ? 'text-green-600' : 'text-gray-300'}`} />
                      </div>
                      {i < 4 && <div className={`w-0.5 flex-1 mt-1 ${event.unlocked ? 'bg-green-200' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-gray-400">{event.date}</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-600" /> Your Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div key={b.id} className={`text-center p-3 rounded-xl ${b.unlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100 opacity-50'}`}>
                    <b.icon className={`w-6 h-6 mx-auto mb-1 ${b.unlocked ? 'text-green-600' : 'text-gray-300'}`} />
                    <p className="text-[10px] font-semibold text-gray-700 leading-tight">{b.name}</p>
                    <p className="text-[9px] text-gray-400">{b.unlocked ? 'Unlocked' : 'Locked'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600" /> Impact Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-xl"><p className="text-lg font-bold text-green-700">{co2Saved.toFixed(1)} kg</p><p className="text-[10px] text-green-600">CO₂ Saved</p></div>
                <div className="text-center p-3 bg-green-50 rounded-xl"><p className="text-lg font-bold text-green-700">{Math.round(co2Saved / 0.5)}</p><p className="text-[10px] text-green-600">Trees Equivalent</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-lg font-bold text-blue-700">{totalOrders}</p><p className="text-[10px] text-blue-600">Total Orders</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-lg font-bold text-blue-700">{reviewCount}</p><p className="text-[10px] text-blue-600">Reviews</p></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <p className="text-sm text-green-800 leading-relaxed italic">"Every token you earn helps plant trees and support sustainable farmers around the world."</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-600" /> Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((e: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${e.id === userId ? 'bg-[#2D5F3F]/5 border border-[#2D5F3F]/20' : ''}`}>
                    <span className="text-xs font-bold w-5 text-center">{i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</span>
                    <span className="text-sm flex-1">{e.name || 'Anonymous'}</span>
                    <span className="text-sm font-bold text-[#2D5F3F]">{Number(e.ecoPoints || 0).toLocaleString()}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No data yet</p>}
              </div>
              <Link href="/leaderboard" className="block text-center text-sm text-[#2D5F3F] hover:underline mt-3 font-medium">View Full Leaderboard →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
