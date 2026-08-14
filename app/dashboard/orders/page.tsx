import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, Package, Calendar, ArrowRight, CheckCircle2, Clock, Truck, ShoppingBag, FileText, Eye, RefreshCw, Shield, Timer, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/pricing';
import { getProductImages } from '@/lib/utils';

type Tab = 'all' | 'active' | 'completed' | 'swaps';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval', accepted: 'Swap Accepted', preparing: 'Preparing',
  shipped: 'In Transit', delivered: 'Delivered', inspecting: 'Inspecting',
  completed: 'Completed', declined: 'Declined', cancelled: 'Cancelled', disputed: 'Disputed',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-teal-100 text-teal-700', inspecting: 'bg-cyan-100 text-cyan-700',
  completed: 'bg-green-500 text-white', declined: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600', disputed: 'bg-orange-100 text-orange-700',
};

export default async function OrdersPage({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sp = await searchParams;
  const activeTab: Tab = (sp?.tab as Tab) || 'all';

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const swaps = await prisma.swapProposal.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    include: { product: { select: { id: true, name: true, images: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const activeOrders = orders.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const displayOrders = activeTab === 'active' ? activeOrders : activeTab === 'completed' ? completedOrders : orders;

  const getStatusStep = (status: string) => {
    const steps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    const idx = steps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const statusLabel = (s: string) => s === 'PENDING' ? 'Order Placed' : s === 'PAID' ? 'Processing' : s === 'SHIPPED' ? 'Shipped' : 'Delivered';

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Track Orders</h1>
            <p className="text-gray-600 mt-1">View and track all your purchases.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#2D5F3F] flex items-center"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-200 w-fit flex-wrap">
          {(['all', 'active', 'completed', 'swaps'] as Tab[]).map(tab => {
            const count = tab === 'all' ? orders.length : tab === 'active' ? activeOrders.length : tab === 'completed' ? completedOrders.length : swaps.length;
            return (
              <Link key={tab} href={`/dashboard/orders${tab !== 'all' ? `?tab=${tab}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#2D5F3F] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                {tab === 'all' ? 'All Orders' : tab === 'active' ? 'Active' : tab === 'completed' ? 'Completed' : 'Swaps'} ({count})
              </Link>
            );
          })}
        </div>

        <div className="space-y-4">
          {activeTab === 'swaps' ? (
            swaps.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <RefreshCw className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Swaps Yet</h3>
                <p className="text-gray-500 mb-6">Browse products and make swap offers using EcoTokens.</p>
                <Link href="/dashboard/seller/swap" className="inline-flex items-center px-6 py-3 bg-[#2D5F3F] text-white rounded-xl font-medium hover:bg-[#1a3a28]">Browse Swap Market</Link>
              </div>
            ) : (
              swaps.map((s: any) => {
                const isIncoming = s.toUserId === userId;
                return (
                  <div key={s.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${s.status === 'completed' ? 'border-green-300' : s.status === 'disputed' ? 'border-orange-300' : 'border-gray-100'}`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-[#2D5F3F]" /></div>
                          <div>
                            <h3 className="font-bold text-gray-900">{s.product?.name || 'Product'}</h3>
                            <p className="text-xs text-gray-500">{isIncoming ? `From: ${s.fromUser?.name || 'Unknown'}` : `To: ${s.toUser?.name || 'Unknown'}`} · {s.amount} tokens</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[s.status] || 'bg-gray-100'}`}>{STATUS_LABELS[s.status] || s.status}</span>
                      </div>

                      {/* Tracking */}
                      {((s as any).sellerATracking || (s as any).sellerBTracking) && (
                        <div className="space-y-1 mb-3 bg-gray-50 p-2 rounded-lg">
                          {(s as any).sellerATracking && <p className="text-xs text-blue-600"><Truck className="w-3 h-3 inline mr-1"/>Seller tracking: {(s as any).sellerATracking}</p>}
                          {(s as any).sellerBTracking && <p className="text-xs text-purple-600"><Truck className="w-3 h-3 inline mr-1"/>Your tracking: {(s as any).sellerBTracking}</p>}
                        </div>
                      )}

                      {/* Inspection timer */}
                      {s.status === 'inspecting' && (s as any).inspectionEndsAt && (
                        <p className="text-xs text-cyan-600 mb-3 flex items-center gap-1"><Timer className="w-3 h-3"/> Inspection ends: {new Date((s as any).inspectionEndsAt).toLocaleString()}</p>
                      )}

                      {/* Dispute info */}
                      {s.status === 'disputed' && (
                        <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mb-3"><AlertTriangle className="w-3 h-3 inline mr-1"/>{(s as any).disputeReason || "Under admin review"}</p>
                      )}

                      {/* Escrow info */}
                      {['pending','accepted','preparing','shipped','delivered','inspecting'].includes(s.status) && (
                        <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded-lg mb-3"><Shield className="w-3 h-3 inline mr-1"/>{s.amount} tokens held in escrow</p>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab !== 'all' ? activeTab : ''} orders</h3>
              <p className="text-gray-500 mb-6">No orders match this filter.</p>
              <Link href="/products" className="inline-flex items-center px-6 py-3 bg-[#2D5F3F] text-white rounded-xl font-medium hover:bg-[#1a3a28]">Start Shopping</Link>
            </div>
          ) : (
            displayOrders.map((order) => {
              const step = getStatusStep(order.status);
              const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{order.status === 'PAID' ? 'Processing' : order.status === 'PENDING' ? 'Order Placed' : order.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {formatPrice(Number(order.total))}</p>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {steps.map((s, i) => (
                          <div key={i} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1 text-center hidden sm:block">{s}</span>
                            </div>
                            {i < 3 && <div className={`flex-1 h-1 mx-1 rounded-full ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image src={getProductImages(item.product.images)[0] || '/placeholder.png'} alt={item.product.name} width={48} height={48} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} · {formatPrice(Number(item.price))} each</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/orders/${order.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"><Eye className="w-4 h-4" /> View Invoice</Link>
                      <Link href={`/dashboard/orders/${order.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F4D35E] text-[#2D5F3F] text-sm font-bold hover:bg-yellow-400 transition-colors">Track Detail <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
