'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, X, Vote as VoteIcon, Loader2, BarChart3, List, CheckCircle, Users, Clock, TrendingUp } from 'lucide-react';

const TOPIC_TYPES = [
  { value: 'product', label: 'Product Category' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'other', label: 'Other' },
];

const TABS = [
  { id: 'manage', label: 'Manage', icon: List },
  { id: 'monitor', label: 'Monitor', icon: BarChart3 },
];

export default function AdminVotingPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('manage');
  const [liveTopics, setLiveTopics] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/voting');
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch {}
    setLoading(false);
  }, []);

  const fetchLiveTopics = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await fetch('/api/voting');
      const data = await res.json();
      if (data.topics) setLiveTopics(data.topics);
    } catch {}
    setLiveLoading(false);
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  useEffect(() => {
    if (tab === 'monitor') fetchLiveTopics();
  }, [tab, fetchLiveTopics]);

  const saveTopic = async (topic: any, action: 'create' | 'update') => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, topic }),
      });
      if (res.ok) {
        setEditing(null);
        await fetchTopics();
      }
    } catch {}
    setSaving(false);
  };

  const deleteTopic = async (topic: any) => {
    if (!confirm(`Delete "${topic.title}"? Votes for this topic will also be removed.`)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', topic: { id: topic.id } }),
      });
      if (res.ok) await fetchTopics();
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voting Topics</h1>
          <p className="text-sm text-gray-500 mt-1">Manage topics and monitor community voting results.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'manage' && (
        <>
        <div className="flex justify-end">
        <button
          onClick={() => setEditing({ id: '', title: '', description: '', type: 'other', options: ['', ''], endsAt: '' })}
          className="px-4 py-2 bg-[#2D5F3F] text-white rounded-xl text-sm font-medium hover:bg-[#234e33] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Topic
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editing.id ? 'Edit Topic' : 'New Topic'}</h2>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <input
                value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                placeholder="Which product category should we add next?"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                value={editing.description}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 resize-none"
                placeholder="Vote for the next category we should focus on growing."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                <select
                  value={editing.type}
                  onChange={e => setEditing({ ...editing, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                >
                  {TOPIC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ends At</label>
                <input
                  type="datetime-local"
                  value={editing.endsAt ? editing.endsAt.slice(0, 16) : ''}
                  onChange={e => setEditing({ ...editing, endsAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Options (one per line)</label>
              <textarea
                value={editing.options.join('\n')}
                onChange={e => setEditing({ ...editing, options: e.target.value.split('\n').filter((s: string) => s.trim()) })}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 resize-none"
                placeholder="Home & Garden&#10;Kids & Toys&#10;Sports & Outdoors"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => saveTopic(editing, editing.id ? 'update' : 'create')}
                disabled={saving || !editing.title || editing.options.length < 2}
                className="px-4 py-2 bg-[#2D5F3F] text-white rounded-xl text-sm font-medium hover:bg-[#234e33] disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {topics.length === 0 && !editing && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <VoteIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No voting topics yet. Create your first one!</p>
          </div>
        )}
        {topics.map((topic: any) => (
          <div key={topic.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{topic.title}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{topic.type}</span>
                </div>
                {topic.description && <p className="text-sm text-gray-500 mb-2">{topic.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {topic.options.map((opt: any) => {
                    const label = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <span key={label} className="text-[11px] px-2 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">{label}</span>
                    );
                  })}
                </div>
                {topic.endsAt && (
                  <p className="text-[11px] text-gray-400 mt-2">Ends {new Date(topic.endsAt).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditing(topic)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTopic(topic)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </> 
      )}

      {tab === 'monitor' && (
        <div className="space-y-6">
          {liveLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" />
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {liveTopics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Active Topics</p>
                        <p className="text-lg font-bold text-gray-900">{liveTopics.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Options</p>
                        <p className="text-lg font-bold text-gray-900">{liveTopics.reduce((s: number, t: any) => s + (t.options?.length || 0), 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Votes Cast</p>
                        <p className="text-lg font-bold text-gray-900">{liveTopics.reduce((s: number, t: any) => s + (t.options?.reduce((s2: number, o: any) => s2 + (o.votes || 0), 0) || 0), 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Topic Results */}
              {liveTopics.map((topic: any) => {
                const totalVotes = topic.options?.reduce((s: number, o: any) => s + (o.votes || 0), 0) || 0;
                const winner = topic.options?.reduce((best: any, o: any) => (!best || (o.votes || 0) > (best.votes || 0)) ? o : best, null);
                const daysLeft = Math.max(0, Math.ceil((new Date(topic.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={topic.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{topic.title}</h3>
                        {topic.description && <p className="text-sm text-gray-500 mt-1">{topic.description}</p>}
                      </div>
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize shrink-0">{topic.type}</span>
                    </div>

                    {/* Results bars */}
                    <div className="space-y-3">
                      {topic.options?.map((opt: any) => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
                        const isWinner = opt.id === winner?.id && opt.votes > 0;
                        return (
                          <div key={opt.id || opt.label} className="relative">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className={'font-medium ' + (isWinner ? 'text-[#2D5F3F]' : 'text-gray-700')}>
                                {opt.label} {isWinner && <CheckCircle className="w-3.5 h-3.5 inline text-[#2D5F3F]" />}
                              </span>
                              <span className={'text-xs ' + (isWinner ? 'font-bold text-[#2D5F3F]' : 'text-gray-400')}>{opt.votes || 0} ({pct}%)</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={'h-full rounded-full transition-all duration-1000 ' + (isWinner ? 'bg-[#2D5F3F]' : 'bg-gray-300')} style={{ width: pct + '%' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                      </div>
                      {winner && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Leading: {winner.label} ({Math.round((winner.votes || 0) / totalVotes * 100)}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {liveTopics.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No voting data available yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
