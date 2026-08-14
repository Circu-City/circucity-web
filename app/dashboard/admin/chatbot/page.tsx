'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, BarChart3, Zap, Bot, Clock, ShoppingBag, Users, TrendingUp } from 'lucide-react';

export default function AdminChatbotPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/chatbot-stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatNum = (n: any) => loading ? '...' : (n ?? 0).toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chatbot Management</h1>
        <p className="text-sm text-gray-500">Monitor AI assistant conversations and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 bg-[#E7F0E9] rounded-xl w-fit mb-3"><MessageSquare className="w-5 h-5 text-[#2D5F3F]" /></div>
          <p className="text-3xl font-bold text-[#2D5F3F]">{formatNum(stats?.totalMessages)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Messages</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 bg-[#FDF8E4] rounded-xl w-fit mb-3"><Users className="w-5 h-5 text-[#D4A373]" /></div>
          <p className="text-3xl font-bold text-[#2D5F3F]">{formatNum(stats?.totalConversations)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Conversations</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 bg-[#E8F8F5] rounded-xl w-fit mb-3"><BarChart3 className="w-5 h-5 text-[#1ABC9C]" /></div>
          <p className="text-3xl font-bold text-[#2D5F3F]">{formatNum(stats?.messagesToday)}</p>
          <p className="text-sm text-gray-500 mt-1">Messages Today</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 bg-[#F4E8F8] rounded-xl w-fit mb-3"><Zap className="w-5 h-5 text-[#815C94]" /></div>
          <p className="text-3xl font-bold text-green-600">{loading ? '...' : (stats?.serviceStatus || '--')}</p>
          <p className="text-sm text-gray-500 mt-1">Service Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-600">Conversations this week</span><span className="text-sm font-bold">{formatNum(stats?.conversationsThisWeek)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Avg response time</span><span className="text-sm font-bold">{loading ? '...' : (stats?.avgResponseTime || '--')}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Active products</span><span className="text-sm font-bold">{formatNum(stats?.activeProducts)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Orders today</span><span className="text-sm font-bold">{formatNum(stats?.ordersToday)}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#2D5F3F]" /> Recent Conversations
          </h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-2 border-[#2D5F3F] border-t-transparent rounded-full" /></div>
          ) : stats?.recentConversations?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Session</th>
                    <th className="py-2 pr-4">Messages</th>
                    <th className="py-2 pr-4">Started</th>
                    <th className="py-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentConversations.map((c: any) => (
                    <tr key={c.sessionId} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-600">{c.id}...</td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{c.messageCount} msgs</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{new Date(c.startedAt).toLocaleString()}</td>
                      <td className="py-2 text-gray-400 text-xs">{new Date(c.lastActivity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No conversations yet.</p></div>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      {stats?.recentMessages?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2D5F3F]" /> Recent Messages
          </h3>
          <div className="space-y-2">
            {stats.recentMessages.map((m: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{m.role}</span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">{m.preview}</p>
                  <p className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleString()} · {m.sessionId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
