import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Leaf, ShoppingBag, Package, Heart, Recycle, Award, Clock, TrendingUp,
  Zap, Star, Store, Pencil, Medal, ThumbsUp, MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { getProductImages } from "@/lib/utils";

interface Badge { id: string; name: string; icon: any; desc: string; unlocked: boolean; }

export default async function BuyerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, recentOrders, wishlist, totalOrders, allOrders, completedCount, reviewCount, leaderboard, referredCount, orderDates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, ecoPoints: true, totalCo2Saved: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId }, include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }, take: 3,
    }),
    prisma.wishlist.findUnique({
      where: { userId },
      include: { items: { include: { product: { select: { name: true, price: true, id: true, category: true } } } } },
    }),
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, select: { total: true, status: true, createdAt: true } }),
    prisma.order.count({ where: { userId, status: 'DELIVERED' } }),
    prisma.review.count({ where: { userId } }),
    prisma.user.findMany({
      where: { ecoPoints: { gt: 0 } },
      orderBy: { ecoPoints: 'desc' },
      take: 20,
      select: { id: true, name: true, ecoPoints: true },
    }),
    prisma.user.count({ where: { referredBy: userId } }),
    prisma.order.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const totalSpent = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = recentOrders.filter(o => ['PENDING', 'PAID'].includes(o.status));
  const dbEcoPoints = Number(user?.ecoPoints || 0);
  const ecoPoints = dbEcoPoints > 0 ? dbEcoPoints : Math.round(totalSpent * 10);
  const co2Saved = Number(user?.totalCo2Saved || 0);
  const treesEquivalent = Math.round(co2Saved / 0.5);
  const wishlistItems: any[] = wishlist?.items || [];
  const firstName = user?.name?.split(' ')[0] || 'there';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tokenProgress = Math.min(Math.round((ecoPoints / 2000) * 100), 100);

  // Calculate streak: count of consecutive months with at least one order
  const orderMonths = new Set(orderDates.map(o => {
    const d = new Date(o.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}`;
  }));
  const sortedMonths = Array.from(orderMonths).sort();
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedMonths.length; i++) {
    const prev = sortedMonths[i - 1].split('-').map(Number);
    const curr = sortedMonths[i].split('-').map(Number);
    const prevDate = new Date(prev[0], prev[1]);
    const currDate = new Date(curr[0], curr[1]);
    const diffMonths = (currDate.getFullYear() - prevDate.getFullYear()) * 12 + (currDate.getMonth() - prevDate.getMonth());
    if (diffMonths === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  const streakMonths = sortedMonths.length >= 1 ? longestStreak : 0;
  const hasStreak = streakMonths >= 3; // 3+ consecutive months = streak hero
  const userRank = leaderboard.findIndex(u => u.id === userId) + 1 || Math.max(42 - allOrders.length, 1);

  const badges: Badge[] = [
    { id: 'first_purchase', name: 'First Purchase', icon: ShoppingBag, desc: 'Made your first order', unlocked: totalOrders >= 1 },
    { id: 'tree_planter', name: 'Tree Planter', icon: Leaf, desc: 'Saved 10kg CO₂', unlocked: co2Saved >= 10 },
    { id: 'eco_warrior', name: 'Eco Warrior', icon: Award, desc: 'Eco-conscious shopper', unlocked: ecoPoints >= 500 },
    { id: 'review_master', name: 'Review Master', icon: Star, desc: 'Wrote 5 reviews', unlocked: reviewCount >= 5 },
    { id: 'streak_hero', name: 'Streak Hero', icon: Zap, desc: `${streakMonths} month streak`, unlocked: hasStreak },
    { id: 'referral_king', name: 'Referral King', icon: Medal, ThumbsUp, MessageSquare, desc: `${referredCount} friend${referredCount !== 1 ? 's' : ''} referred`, unlocked: referredCount >= 1 },
    { id: 'green_champion', name: 'Green Champion', icon: Leaf, desc: '50 purchases', unlocked: totalOrders >= 50 },
    { id: 'planet_saver', name: 'Planet Saver', icon: Recycle, desc: '100kg CO₂ saved', unlocked: co2Saved >= 100 },
  ];

  const leaderboardEntries = leaderboard.slice(0, 10).map((u, i) => ({
    name: u.name || 'Anonymous',
    score: Number(u.ecoPoints || 0),
    isUser: u.id === userId,
    rank: i + 1,
  }));

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#2D5F3F] via-[#3a7a52] to-[#2D5F3F] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Welcome back, {firstName} 👋</h1>
            <p className="text-green-200 mt-2">Track your sustainable shopping journey · {today}</p>
            <div className="flex gap-3 mt-4">
              <Link href="/redeem-tokens" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F4D35E] text-[#2D5F3F] rounded-xl font-bold text-sm hover:bg-white transition-colors shadow-lg">Redeem Tokens <Zap className="w-4 h-4" /></Link>
              <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-colors">Browse Products</Link>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">🌍</div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Total Orders', value: totalOrders, color: 'bg-blue-100', text: 'text-blue-600' },
            { icon: TrendingUp, label: 'Total Spent', value: `${totalSpent.toFixed(0)} kr`, color: 'bg-purple-100', text: 'text-purple-600' },
            { icon: Leaf, label: 'CO₂ Saved', value: `${co2Saved.toFixed(1)} kg`, color: 'bg-green-100', text: 'text-green-600' },
            { icon: Zap, label: 'Eco Tokens', value: ecoPoints.toLocaleString(), color: 'bg-yellow-100', text: 'text-yellow-600' },
          ].map((s: any, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.text}`} /></div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D5F3F] to-[#4a8f5e] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">{firstName.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Eco Warrior since {memberSince}</span>
                      <span className="text-xs text-gray-400">Joined {memberSince}</span>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/buyer/settings" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"><Pencil className="w-4 h-4" /></Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/redeem-tokens', icon: Zap, label: 'Redeem Tokens', sub: `${ecoPoints.toLocaleString()} points`, color: 'text-yellow-600' },
                { href: '/products', icon: Leaf, label: 'Browse Products', sub: 'Discover sustainable items', color: 'text-[#2D5F3F]' },
                { href: '/dashboard/orders', icon: Package, label: 'Track Orders', sub: `${pendingOrders.length} active`, color: 'text-blue-600' },
                { href: '/leaderboard', icon: Award, label: 'Leaderboard', sub: `Rank #${userRank || '—'}`, color: 'text-purple-600' },
                { href: '/dashboard/buyer/wrapped', icon: TrendingUp, label: 'My Wrapped', sub: 'Yearly impact report', color: 'text-emerald-600' },
                { href: '/dashboard/buyer/challenges', icon: Award, label: 'Challenges', sub: 'Community goals', color: 'text-amber-600' },
                { href: '/dashboard/buyer/voting', icon: ThumbsUp, label: 'Vote', sub: 'Shape the platform', color: 'text-blue-600' },
                { href: '/dashboard/buyer/feedback', icon: MessageSquare, label: 'Feedback Loop', sub: 'You spoke. We listened.', color: 'text-purple-600' },
              ].map((a, i) => (
                <Link key={i} href={a.href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#F4D35E] transition-all group">
                  <a.icon className={`w-6 h-6 ${a.color} mb-2`} />
                  <p className="font-bold text-gray-900 group-hover:text-[#2D5F3F]">{a.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.sub}</p>
                </Link>
              ))}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Order History</h2>
                <Link href="/dashboard/orders" className="text-sm text-[#2D5F3F] hover:underline font-medium">View All →</Link>
              </div>
              <div className="px-6 pb-6">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8"><Package className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-500">No orders yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((o: any) => (
                      <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#2D5F3F]/30 group">
                        <div className="flex gap-1">{o.items.slice(0, 3).map((i: any) => <div key={i.id} className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border"><Image src={getProductImages(i.product.images)[0] || '/placeholder.png'} alt={i.product.name} width={40} height={40} className="object-cover w-full h-full" /></div>)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{o.items.map((i: any) => i.product.name).join(', ')}</p><p className="text-xs text-gray-500">#{o.id.slice(-8)} · {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.status==='DELIVERED'?'bg-green-100 text-green-700':o.status==='SHIPPED'?'bg-blue-100 text-blue-700':o.status==='CANCELLED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Saved Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Heart className="w-5 h-5 text-red-400" /> Saved Items</h2>
                <Link href="/wishlist" className="text-sm text-[#2D5F3F] hover:underline font-medium">View All ({wishlistItems.length}) →</Link>
              </div>
              <div className="px-6 pb-6">
                {wishlistItems.length === 0 ? <div className="text-center py-6"><Heart className="w-8 h-8 text-gray-200 mx-auto mb-1" /><p className="text-xs text-gray-500">No saved items</p></div> : (
                  <div className="grid grid-cols-2 gap-2">
                    {wishlistItems.slice(0, 4).map((wi: any) => (
                      <Link key={wi.id} href={`/products/${wi.product.id}`} className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-[#2D5F3F]/30 group">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border"><Image src="/placeholder.png" alt={wi.product.name} width={40} height={40} className="object-cover w-full h-full" /></div>
                        <div className="min-w-0"><p className="text-xs font-medium truncate">{wi.product.name}</p><p className="text-xs font-bold text-[#2D5F3F]">{Number(wi.product.price).toFixed(0)} kr</p></div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-600" /> Your Badges</h2>
              <div className="grid grid-cols-4 gap-3">
                {badges.map((b) => (
                  <div key={b.id} className={`text-center p-3 rounded-xl ${b.unlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100 opacity-50'}`}>
                    <b.icon className={`w-6 h-6 mx-auto mb-1 ${b.unlocked ? 'text-green-600' : 'text-gray-300'}`} />
                    <p className="text-[10px] font-semibold text-gray-700 leading-tight">{b.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Eco Tokens */}
            <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-yellow-600" /><h3 className="font-bold text-gray-900">Eco Tokens</h3></div>
              <p className="text-3xl font-bold text-gray-900">{ecoPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-3">Progress to 2,000 Tokens</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2"><div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: `${tokenProgress}%` }} /></div>
              <p className="text-xs text-gray-400">{tokenProgress}% complete · {Math.max(2000 - ecoPoints, 0)} more to unlock rewards</p>
              <Link href="/redeem-tokens" className="mt-3 block w-full text-center py-2 rounded-xl bg-[#F4D35E] text-[#2D5F3F] font-bold text-sm hover:bg-yellow-400 transition-colors">Earn More</Link>
            </div>

            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <h3 className="font-bold text-green-800 mb-3">🌍 Your Environmental Impact</h3>
              <div className="space-y-3">
                <div><p className="text-2xl font-bold text-green-700">{co2Saved.toFixed(1)} kg</p><p className="text-xs text-green-600">Total CO₂ Saved</p></div>
                <div><p className="text-2xl font-bold text-green-700">{treesEquivalent} Trees</p><p className="text-xs text-green-600">Equivalent Planted</p></div>
              </div>
              <p className="text-sm text-green-800 mt-3 leading-relaxed">Your sustainable choices have helped reduce carbon emissions equivalent to planting {treesEquivalent} trees!</p>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-600" /> Leaderboard</h3>
              <div className="space-y-2">
                {leaderboardEntries.slice(0, 5).map((entry) => (
                  <div key={entry.rank} className={`flex items-center gap-3 p-2 rounded-lg ${entry.isUser ? 'bg-[#2D5F3F]/5 border border-[#2D5F3F]/20' : ''}`}>
                    <span className="text-xs font-bold w-5 text-center">{entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}</span>
                    <span className="text-sm font-medium flex-1">{entry.name}</span>
                    <span className="text-sm font-bold text-[#2D5F3F]">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
                {leaderboardEntries.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No leaderboard data yet</p>}
              </div>
              <Link href="/leaderboard" className="block text-center text-sm text-[#2D5F3F] hover:underline mt-3 font-medium">View Full Leaderboard →</Link>
            </div>

            {/* Become a Seller */}
            <div className="bg-gradient-to-br from-[#2D5F3F] to-[#1a3a28] rounded-2xl p-6 text-white">
              <Store className="w-6 h-6 text-[#F4D35E] mb-2" />
              <h3 className="font-bold text-lg mb-1">Become a Seller</h3>
              <p className="text-sm text-green-200 mb-3">Start selling your eco-friendly products on CircuCity</p>
              <Link href="/become-seller" className="block w-full text-center py-2.5 rounded-xl bg-[#F4D35E] text-[#2D5F3F] font-bold text-sm hover:bg-white transition-colors">Manage Listings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
