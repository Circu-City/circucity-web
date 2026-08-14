"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RefreshCw, Plus, ArrowRight, Search, Heart, MapPin, Star, Package,
  Box, Sparkles, MessageCircle, Zap, Send, X, Loader2, Inbox, Clock,
  Check, Ban, User, Truck, AlertTriangle, Shield, Timer,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Garden", "Books", "Music", "Plants", "Sports"];
const CONDITIONS = ["all", "New", "Like New", "Excellent", "Good", "Vintage"];

const OFFER_TABS = ["Browse", "Sent Offers", "Received Offers"];
const SWAP_TABS = ["Active Swaps", "Completed", "Disputes"];

export default function SellerSwapPage() {
  const [mainTab, setMainTab] = useState<"browse" | "offers" | "swaps">("browse");
  const [offerSubTab, setOfferSubTab] = useState("Sent Offers");
  const [swapSubTab, setSwapSubTab] = useState("Active Swaps");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [condition, setCondition] = useState("all");
  const [offerItem, setOfferItem] = useState<any>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSwapProduct, setOfferSwapProduct] = useState("");
  const [offerSwapId, setOfferSwapId] = useState("");
  const [mySwapProducts, setMySwapProducts] = useState<any[]>([]);
  const [swapSearch, setSwapSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myItemCount, setMyItemCount] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [trackingInput, setTrackingInput] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState<any>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const fetchProposals = async (filter?: string) => {
    try {
      const url = filter ? `/api/swap/proposals?filter=${filter}` : "/api/swap/proposals";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch {}
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/ai/products?limit=100").then(r => r.json()).catch(() => []),
      fetch("/api/dashboard/overview", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
      fetch("/api/swap/proposals", { credentials: "include" }).then(r => r.json()).catch(() => ({ proposals: [] })),
    ]).then(([data, overview, propData]) => {
      const allProducts = Array.isArray(data) ? data : [];
      const browseItems = allProducts.map((p: any, i: number) => ({
        id: p.id || `browse-${i}`, name: p.name || 'Product',
        category: p.category || 'General',
        location: "Seller location",
        condition: p.condition || "Good",
        seller: p.shop?.name || 'CircuCity Seller',
        rating: p.rating || '—',
        tokens: Math.round(Number(p.price || 0) * 0.8),
        image: p.image || null, desc: p.description || "Sustainable product available for swap",
        isMine: false, ownerId: p.shop?.ownerId || null,
      }));
      const myCount = overview?.productsCount || 0;
      setProducts(browseItems); setMyItemCount(myCount);
      setMyItems([]);
      setEcoPoints(overview?.stats?.ecoPoints || overview?.user?.ecoPoints || 0);
      setProposals(propData.proposals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mainTab === "offers") fetchProposals(offerSubTab === "Sent Offers" ? "sent" : "received");
    else if (mainTab === "swaps") fetchProposals(swapSubTab === "Active Swaps" ? "active" : swapSubTab.toLowerCase());
  }, [mainTab, offerSubTab, swapSubTab]);

  useEffect(() => { const saved = localStorage.getItem('swap_saved'); if (saved) setSavedItems(JSON.parse(saved)); }, []);
  const toggleSave = (id: string) => {
    setSavedItems(prev => { const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]; localStorage.setItem('swap_saved', JSON.stringify(next)); return next; });
    toast.success(savedItems.includes(id) ? "Removed" : "Saved!");
  };

  const scrollToHowItWorks = () => howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleMakeOffer = async (item: any) => {
    setOfferItem(item); setOfferAmount(String(item.tokens)); setOfferMessage(""); setOfferSwapProduct(""); setOfferSwapId(""); setSwapSearch("");
    try {
      const res = await fetch("/api/ai/products?limit=100", { credentials: "include" });
      const data = await res.json();
      const myProducts = Array.isArray(data) ? data.filter((p: any) => p.shop?.ownerId && p.status !== 'SOLD').map((p: any) => ({
        id: p.id, name: p.name, price: p.price, tokens: Math.round(Number(p.price || 100) * 0.8),
      })) : [];
      setMySwapProducts(myProducts);
    } catch { setMySwapProducts([]); }
  };
  const submitOffer = async () => {
    if (!offerAmount || parseInt(offerAmount) <= 0) { toast.error("Enter valid amount"); return; }
    try {
      const res = await fetch("/api/swap/proposals", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: offerItem.id, amount: parseInt(offerAmount),
          message: offerMessage, toUserId: offerItem.ownerId || undefined,
          swapProductId: offerSwapId || undefined,
          swapProductName: offerSwapProduct || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Offer sent! Tokens held in escrow until completion.");
        setOfferItem(null); setMySwapProducts([]); setSwapSearch(""); setOfferSwapProduct(""); setOfferSwapId("");
        if (mainTab === "offers") fetchProposals("sent");
      } else { toast.error(data.error || "Failed"); }
    } catch { toast.error("Failed"); }
  };

  const handleAction = async (id: string, st: string, tracking?: string) => {
    try {
      const body: any = { id, status: st, tracking };
      const res = await fetch("/api/swap/proposals", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        const msgs: Record<string, string> = {
          accepted: "Accepted! Both parties can now prepare items for shipping.",
          declined: "Declined. Tokens returned to buyer.", cancelled: "Cancelled. Tokens returned.",
          shipped: "Marked as shipped!", completed: "Swap completed! Tokens released to seller.",
          disputed: "Dispute filed. Admin will review.",
        };
        toast.success(msgs[st] || `Status: ${st}`);
        setShowDisputeModal(null);
        if (mainTab === "offers") fetchProposals(offerSubTab === "Sent Offers" ? "sent" : "received");
        else if (mainTab === "swaps") fetchProposals(swapSubTab === "Active Swaps" ? "active" : swapSubTab.toLowerCase());
      } else { toast.error(data.error || "Failed"); }
    } catch { toast.error("Failed"); }
  };

  const fileDispute = async (proposal: any) => {
    if (!disputeReason) { toast.error("Describe the issue"); return; }
    try {
      const res = await fetch("/api/swap/proposals", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: proposal.id, status: "disputed", evidence: { reason: disputeReason, details: "" } }) });
      if (res.ok) { toast.success("Dispute filed"); setShowDisputeModal(null); setDisputeReason(""); fetchProposals("active"); }
      else { toast.error("Failed"); }
    } catch { toast.error("Failed"); }
  };

  const statusColor = (s: string) => {
    const c: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", accepted: "bg-blue-100 text-blue-700", preparing: "bg-indigo-100 text-indigo-700", shipped: "bg-purple-100 text-purple-700", delivered: "bg-teal-100 text-teal-700", inspecting: "bg-cyan-100 text-cyan-700", completed: "bg-green-500 text-white", declined: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-600", disputed: "bg-orange-100 text-orange-700", expired: "bg-gray-100 text-gray-400" };
    return c[s] || "bg-gray-100 text-gray-600";
  };

  const renderProposalCard = (p: any) => (
    <div key={p.id} className={`border rounded-xl p-4 ${p.status === 'completed' ? 'border-green-300 bg-green-50/50' : p.status === 'disputed' ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-[#2D5F3F]" />
          <div>
            <p className="font-bold text-sm">{p.product?.name || 'Product'}</p>
            <p className="text-xs text-gray-500">{p.incoming ? `From: ${p.fromUser}` : `To: ${p.toUser}`} · {p.amount} tokens in escrow</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(p.status)}`}>{p.statusLabel || p.status}</span>
      </div>
      {p.message && <p className="text-sm text-gray-600 bg-white/70 p-2 rounded-lg mb-2">"{p.message}"</p>}
      {p.swapProductName && <p className="text-xs text-gray-500 mb-2">Swap item: {p.swapProductName}</p>}

      {/* Tracking info */}
      {(p.sellerATracking || p.sellerBTracking) && (
        <div className="space-y-1 mb-2">
          {p.sellerATracking && <p className="text-xs text-blue-600"><Truck className="w-3 h-3 inline mr-1"/>Seller: {p.sellerATracking}</p>}
          {p.sellerBTracking && <p className="text-xs text-purple-600"><Truck className="w-3 h-3 inline mr-1"/>Buyer: {p.sellerBTracking}</p>}
        </div>
      )}

      {/* Inspection timer */}
      {p.status === 'inspecting' && p.inspectionEndsAt && (
        <p className="text-xs text-cyan-600 mb-2 flex items-center gap-1"><Timer className="w-3 h-3"/> Inspection ends: {new Date(p.inspectionEndsAt).toLocaleString()}</p>
      )}

      {/* Dispute info */}
      {p.status === 'disputed' && (
        <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mb-2"><AlertTriangle className="w-3 h-3 inline mr-1"/>{p.disputeReason || "Under admin review"}</p>
      )}

      {/* Actions based on status */}
      {p.incoming && p.status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={() => handleAction(p.id, 'accepted')} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"><Check className="w-3 h-3 inline mr-1"/> Accept</button>
          <button onClick={() => handleAction(p.id, 'declined')} className="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300"><Ban className="w-3 h-3 inline mr-1"/> Decline</button>
        </div>
      )}

      {!p.incoming && p.status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={() => handleAction(p.id, 'cancelled')} className="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300"><X className="w-3 h-3 inline mr-1"/> Cancel Offer</button>
        </div>
      )}

      {(p.status === 'accepted' || p.status === 'preparing') && (
        <div className="space-y-2">
          <p className="text-xs text-blue-600 font-medium">Pack your item. Add tracking and mark as shipped when ready.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Tracking number..." value={trackingInput} onChange={e => setTrackingInput(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border text-xs focus:border-blue-500 outline-none" />
            <button onClick={() => handleAction(p.id, 'shipped', trackingInput || undefined)} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 flex items-center gap-1"><Truck className="w-3 h-3"/> Mark Shipped</button>
          </div>
        </div>
      )}

      {p.status === 'shipped' && (
        <div className="space-y-2">
          <p className="text-xs text-purple-600 font-medium">Waiting for both parties to mark as shipped.</p>
        </div>
      )}

      {p.status === 'delivered' && (
        <div className="space-y-2">
          <p className="text-xs text-teal-600 font-medium">Both items delivered! Confirm receipt to start inspection.</p>
          <button onClick={() => handleAction(p.id, 'inspecting')} className="w-full py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600"><Check className="w-3 h-3 inline mr-1"/> Confirm Receipt</button>
        </div>
      )}

      {p.status === 'inspecting' && (
        <div className="space-y-2">
          <p className="text-xs text-cyan-600 font-medium">Inspection period — confirm or file a dispute.</p>
          <div className="flex gap-2">
            <button onClick={() => handleAction(p.id, 'completed')} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"><Check className="w-3 h-3 inline mr-1"/> Confirm & Complete</button>
            <button onClick={() => setShowDisputeModal(p)} className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600"><AlertTriangle className="w-3 h-3 inline mr-1"/> Report Issue</button>
          </div>
        </div>
      )}

      {p.status === 'completed' && (
        <p className="text-xs text-green-600 font-medium"><Check className="w-3 h-3 inline mr-1"/>Swap completed! {p.incoming ? `You earned ${p.amount} tokens.` : "Thanks for participating!"}</p>
      )}
    </div>
  );

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]"/></div>);

  const filteredBrowse = (mainTab === "browse" ? products : [])
    .filter(item => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (condition !== "all" && item.condition !== condition) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === "low" ? a.tokens - b.tokens : sortBy === "high" ? b.tokens - a.tokens : 0);

  const pendingSent = proposals.filter(p => p.status === 'pending' && !p.incoming).length;
  const pendingReceived = proposals.filter(p => p.status === 'pending' && p.incoming).length;
  const activeCount = proposals.filter(p => ["accepted","preparing","shipped","delivered","inspecting"].includes(p.status)).length;
  const disputeCount = proposals.filter(p => p.status === 'disputed').length;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2D5F3F] via-[#3a7a52] to-[#2D5F3F] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-[#F4D35E] text-[#2D5F3F] text-xs font-bold rounded-full mb-4">CircuCity Swap</span>
          <h1 className="text-3xl font-bold mb-2">Circular Economy Marketplace</h1>
          <p className="text-green-200 max-w-xl mb-6">Swap products with EcoTokens. Tokens are held in escrow until both parties confirm delivery.</p>
          <div className="flex gap-3">
            <Link href="/dashboard/seller/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F4D35E] text-[#2D5F3F] rounded-xl font-bold text-sm hover:bg-white transition-colors"><Plus className="w-4 h-4"/> List an Item</Link>
            <button onClick={scrollToHowItWorks} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30">How it Works</button>
          </div>
        </div>
        <div className="relative z-10 flex gap-8 mt-8">
          {[{ v: products.length, l: "Available" }, { v: myItemCount, l: "Your Items" }, { v: activeCount, l: "Active Swaps" }].map((s, i) => (<div key={i}><p className="text-2xl font-bold">{typeof s.v === 'number' ? s.v.toLocaleString() : s.v}</p><p className="text-green-200 text-sm">{s.l}</p></div>))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center border-b border-gray-100 overflow-x-auto">
          <button onClick={() => setMainTab("browse")} className={`px-5 py-3.5 text-sm font-semibold ${mainTab === "browse" ? 'text-[#2D5F3F] border-b-2 border-[#2D5F3F]' : 'text-gray-500'}`}>Browse</button>
          <button onClick={() => setMainTab("offers")} className={`px-5 py-3.5 text-sm font-semibold ${mainTab === "offers" ? 'text-[#2D5F3F] border-b-2 border-[#2D5F3F]' : 'text-gray-500'}`}>
            Offers {pendingSent + pendingReceived > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{pendingSent + pendingReceived}</span>}
          </button>
          <button onClick={() => setMainTab("swaps")} className={`px-5 py-3.5 text-sm font-semibold ${mainTab === "swaps" ? 'text-[#2D5F3F] border-b-2 border-[#2D5F3F]' : 'text-gray-500'}`}>
            Swaps {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">{activeCount}</span>}
            {disputeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">{disputeCount}</span>}
          </button>
        </div>

        {/* Content */}
        {mainTab === "browse" && (
          <>
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm"/></div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm"><option value="recent">Recent</option><option value="low">Token Low</option><option value="high">Token High</option></select>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm">{CONDITIONS.map(c => <option key={c} value={c}>{c === 'all' ? 'All' : c}</option>)}</select>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">{CATEGORIES.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${activeCategory === cat ? 'bg-[#2D5F3F] text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>))}</div>
            </div>
            {filteredBrowse.length === 0 ? (
              <div className="text-center py-16"><Package className="w-16 h-16 text-gray-200 mx-auto mb-4"/><p className="text-gray-500">No items found.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {filteredBrowse.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md group">
                    <div className="relative h-40 bg-gray-100">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"><Package className="w-12 h-12 text-gray-300"/></div>}
                      <button onClick={() => toggleSave(item.id)} className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm ${savedItems.includes(item.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'}`}><Heart className={`w-4 h-4 ${savedItems.includes(item.id) ? 'fill-current' : ''}`}/></button>
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold">{item.category}</span>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3"/>{item.location} · <span className="text-[#2D5F3F] font-medium">{item.condition}</span></div>
                      <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">{item.seller.charAt(0)}</div>{item.seller}<Star className="w-3 h-3 fill-yellow-500 text-yellow-500"/>{item.rating}</div>
                      <div className="flex items-center justify-between pt-1 border-t">
                        <p className="font-bold text-[#2D5F3F] text-sm">{item.tokens} <span className="text-xs font-normal text-gray-400">Tokens</span></p>
                        <button onClick={() => handleMakeOffer(item)} className="flex items-center gap-1 px-3 py-1.5 bg-[#2D5F3F] text-white text-xs font-bold rounded-lg hover:bg-[#1a3a28]"><ArrowRight className="w-3 h-3"/> Offer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mainTab === "offers" && (
          <div>
            <div className="flex border-b border-gray-100">
              {OFFER_TABS.map(t => (
                <button key={t} onClick={() => setOfferSubTab(t)} className={`px-4 py-2.5 text-xs font-semibold ${offerSubTab === t ? 'text-[#2D5F3F] border-b-2 border-[#2D5F3F]' : 'text-gray-500'}`}>
                  {t} {t === "Sent Offers" && pendingSent > 0 && <span className="ml-1 px-1 py-0.5 bg-yellow-500 text-white text-[10px] rounded-full">{pendingSent}</span>}
                  {t === "Received Offers" && pendingReceived > 0 && <span className="ml-1 px-1 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{pendingReceived}</span>}
                </button>
              ))}
            </div>
            <div className="p-4">
              {(() => {
                const filtered = proposals.filter(p => offerSubTab === "Received Offers" ? p.incoming : !p.incoming);
                return filtered.length === 0 ? (
                  <div className="text-center py-16"><Inbox className="w-16 h-16 text-gray-200 mx-auto mb-4"/><h3 className="font-bold text-gray-900 mb-2">No {offerSubTab.toLowerCase()}</h3><p className="text-gray-500">Browse products and make swap offers using EcoTokens.</p></div>
                ) : (
                  <div className="space-y-3">{filtered.map(renderProposalCard)}</div>
                );
              })()}
            </div>
          </div>
        )}

        {mainTab === "swaps" && (
          <div>
            <div className="flex border-b border-gray-100">
              {SWAP_TABS.map(t => (
                <button key={t} onClick={() => setSwapSubTab(t)} className={`px-4 py-2.5 text-xs font-semibold ${swapSubTab === t ? 'text-[#2D5F3F] border-b-2 border-[#2D5F3F]' : 'text-gray-500'}`}>
                  {t} {t === "Active Swaps" && activeCount > 0 && <span className="ml-1 px-1 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">{activeCount}</span>}
                  {t === "Disputes" && disputeCount > 0 && <span className="ml-1 px-1 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">{disputeCount}</span>}
                </button>
              ))}
            </div>
            <div className="p-4">
              {(() => {
                const filtered = proposals.filter(p => {
                  if (swapSubTab === "Active Swaps") return ["accepted","preparing","shipped","delivered","inspecting"].includes(p.status);
                  if (swapSubTab === "Completed") return p.status === "completed";
                  if (swapSubTab === "Disputes") return p.status === "disputed";
                  return true;
                });
                return filtered.length === 0 ? (
                  <div className="text-center py-16"><Package className="w-16 h-16 text-gray-200 mx-auto mb-4"/><h3 className="font-bold text-gray-900 mb-2">No {swapSubTab.toLowerCase()}</h3><p className="text-gray-500">{swapSubTab === "Active Swaps" ? "When offers are accepted, active swaps appear here." : swapSubTab === "Disputes" ? "No disputes filed." : "Completed swaps will appear here."}</p></div>
                ) : (
                  <div className="space-y-3">{filtered.map(renderProposalCard)}</div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {offerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold">Make an Offer</h3><button onClick={() => { setOfferItem(null); setMySwapProducts([]); setSwapSearch(""); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button></div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Package className="w-10 h-10 text-[#2D5F3F]"/><div><p className="font-bold text-sm">{offerItem.name}</p><p className="text-xs text-gray-500">Listed for {offerItem.tokens} Tokens</p></div></div>
              <div><label className="block text-sm font-medium mb-1.5">Your swap item (optional)</label>
                {mySwapProducts.length > 0 ? (
                  <div className="relative">
                    <input type="text" value={swapSearch || offerSwapProduct} onChange={e => { setSwapSearch(e.target.value); if (!e.target.value) { setOfferSwapProduct(""); setOfferSwapId(""); } }} placeholder="Search your products..." className="w-full px-4 py-2.5 rounded-xl border focus:border-[#2D5F3F] outline-none text-sm" />
                    {(swapSearch && !offerSwapId) && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {mySwapProducts.filter(p => p.name.toLowerCase().includes(swapSearch.toLowerCase())).slice(0, 8).map((p: any) => (
                          <button key={p.id} type="button" onClick={() => { setOfferSwapProduct(p.name); setOfferSwapId(p.id); setSwapSearch(p.name); }} className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm border-b last:border-0 flex justify-between">
                            <span className="truncate">{p.name}</span>
                            <span className="text-xs text-[#2D5F3F] font-medium ml-2 shrink-0">{p.tokens} tokens</span>
                          </button>
                        ))}
                        {mySwapProducts.filter(p => p.name.toLowerCase().includes(swapSearch.toLowerCase())).length === 0 && (
                          <p className="px-4 py-3 text-xs text-gray-400">No matching products. <button type="button" onClick={() => { setOfferSwapProduct(swapSearch); setOfferSwapId(""); }} className="text-[#2D5F3F] underline">Use "{swapSearch}"</button></p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <input type="text" value={offerSwapProduct} onChange={e => { setOfferSwapProduct(e.target.value); setOfferSwapId(""); }} placeholder="What are you offering in exchange?" className="w-full px-4 py-2.5 rounded-xl border focus:border-[#2D5F3F] outline-none text-sm"/>
                )}
                {offerSwapId && <p className="text-xs text-green-600 mt-1">Selected from your listings</p>}</div>
              <div><label className="block text-sm font-medium mb-1.5">EcoToken Offer</label><input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border focus:border-[#2D5F3F] outline-none text-sm"/></div>
              <div><label className="block text-sm font-medium mb-1.5">Message</label><textarea value={offerMessage} onChange={e => setOfferMessage(e.target.value)} rows={3} placeholder="Hi! I'm interested..." className="w-full px-4 py-2.5 rounded-xl border focus:border-[#2D5F3F] outline-none text-sm resize-none"/></div>
              <p className="text-xs text-gray-400">Your balance: {ecoPoints.toLocaleString()} tokens. Tokens held in escrow until completion.</p>
              <button onClick={submitOffer} className="w-full py-3 rounded-xl bg-[#2D5F3F] text-white font-bold hover:bg-[#1a3a28] flex items-center justify-center gap-2"><Send className="w-4 h-4"/> Send Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold">Report Issue</h3><button onClick={() => setShowDisputeModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button></div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">Describe the problem with your swap.</p>
              <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={3} placeholder="What went wrong? (Wrong item, damaged, not received...)" className="w-full px-4 py-2.5 rounded-xl border focus:border-orange-500 outline-none text-sm resize-none"/>
              <button onClick={() => fileDispute(showDisputeModal)} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4"/> File Dispute</button>
            </div>
          </div>
        </div>
      )}

      {/* How Swapping Works */}
      <div ref={howItWorksRef} className="bg-white rounded-2xl border shadow-sm p-8 scroll-mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">How Swapping Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Box, title: "Make an Offer", desc: "Browse items, propose a swap with EcoTokens. Tokens are held in escrow." },
            { icon: Check, title: "Accept & Prepare", desc: "Both parties accept and prepare items for shipping." },
            { icon: Truck, title: "Ship & Track", desc: "Each party ships their item with tracking. Both confirm delivery." },
            { icon: Shield, title: "Inspect & Complete", desc: "72-hour inspection. Confirm or dispute. Tokens released on completion." }
          ].map((s, i) => (
            <div key={i} className="text-center"><div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4"><s.icon className="w-8 h-8 text-[#2D5F3F]"/></div><h3 className="font-bold mb-2">{s.title}</h3><p className="text-sm text-gray-500">{s.desc}</p></div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#2D5F3F] to-[#1a3a28] rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Start Swapping?</h2>
        <p className="text-green-200 mb-6">Tokens are escrowed until both parties confirm — safe for everyone.</p>
        <Link href="/dashboard/seller/products/new" className="inline-flex items-center gap-2 px-8 py-3 bg-[#F4D35E] text-[#2D5F3F] rounded-xl font-bold text-lg hover:bg-white"><Plus className="w-5 h-5"/> List Your First Item</Link>
      </div>
    </div>
  );
}
