'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, X, Target, Loader2, Leaf, ShoppingBag, Trees, Award, BarChart3, List, TrendingUp } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'leaf', label: 'Leaf' },
  { value: 'shopping-bag', label: 'Shopping Bag' },
  { value: 'trees', label: 'Trees' },
  { value: 'target', label: 'Target' },
  { value: 'zap', label: 'Zap' },
  { value: 'globe', label: 'Globe' },
];

const ICON_MAP: Record<string, any> = { leaf: Leaf, 'shopping-bag': ShoppingBag, trees: Trees };

const TABS = [
  { id: 'manage', label: 'Manage', icon: List },
  { id: 'monitor', label: 'Monitor', icon: BarChart3 },
];

export default function AdminChallengesPage() {
  const [tab, setTab] = useState('manage');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [liveChallenges, setLiveChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (data.challenges) setChallenges(data.challenges);
    } catch {}
    setLoading(false);
  }, []);

  const fetchLiveChallenges = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.challenges) setLiveChallenges(data.challenges);
    } catch {}
    setLiveLoading(false);
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  useEffect(() => {
    if (tab === 'monitor') fetchLiveChallenges();
  }, [tab, fetchLiveChallenges]);

  const saveChallenge = async (challenge: any, action: 'create' | 'update') => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, challenge }),
      });
      if (res.ok) {
        setEditing(null);
        await fetchChallenges();
      }
    } catch {}
    setSaving(false);
  };

  const deleteChallenge = async (challenge: any) => {
    if (!confirm(`Delete "${challenge.title}"?`)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', challenge: { id: challenge.id } }),
      });
      if (res.ok) await fetchChallenges();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Challenges</h1>
          <p className="text-sm text-gray-500 mt-1">Manage challenges and monitor community progress.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'manage' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setEditing({ id: '', title: '', description: '', icon: 'target', target: '', unit: '', deadline: '', badge: '' })}
              className="px-4 py-2 bg-[#2D5F3F] text-white rounded-xl text-sm font-medium hover:bg-[#234e33] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Challenge
            </button>
          </div>

          {editing && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">{editing.id ? 'Edit Challenge' : 'New Challenge'}</h2>
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
                    placeholder="100 Tons CO\xb2 Challenge"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 resize-none"
                    placeholder="Together we can save 100 tons of CO\xb2."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Icon</label>
                    <select
                      value={editing.icon}
                      onChange={e => setEditing({ ...editing, icon: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                    >
                      {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Badge Name</label>
                    <input
                      value={editing.badge}
                      onChange={e => setEditing({ ...editing, badge: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                      placeholder="Planet Protector"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Target</label>
                    <input
                      type="number"
                      value={editing.target}
                      onChange={e => setEditing({ ...editing, target: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                    <input
                      value={editing.unit}
                      onChange={e => setEditing({ ...editing, unit: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                      placeholder="kg CO\xb2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Deadline</label>
                    <input
                      type="datetime-local"
                      value={editing.deadline ? editing.deadline.slice(0, 16) : ''}
                      onChange={e => setEditing({ ...editing, deadline: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={() => saveChallenge(editing, editing.id ? 'update' : 'create')}
                    disabled={saving || !editing.title || !editing.target}
                    className="px-4 py-2 bg-[#2D5F3F] text-white rounded-xl text-sm font-medium hover:bg-[#234e33] disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Challenge'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" />
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.length === 0 && !editing && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Target className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No challenges yet. Create your first one!</p>
                </div>
              )}
              {challenges.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#2D5F3F]/10 flex items-center justify-center text-[#2D5F3F] shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{c.title}</h3>
                          {c.badge && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{c.badge}</span>
                          )}
                        </div>
                        {c.description && <p className="text-sm text-gray-500 mb-2">{c.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>Target: {c.target.toLocaleString()} {c.unit}</span>
                          {c.deadline && <span>Deadline: {new Date(c.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditing(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteChallenge(c)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'monitor' && (
        <div className="space-y-6">
          {liveLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" />
            </div>
          ) : (
            <>
              {liveChallenges.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {liveChallenges.map((c: any) => {
                    const progress = Math.min(Math.round((c.current / c.target) * 100), 100);
                    const Icon = ICON_MAP[c.icon] || Target;
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{c.title.split('(')[0].trim()}</p>
                            <p className="text-lg font-bold text-gray-900">{progress}%</p>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#2D5F3F] to-[#4a8f5e] rounded-full transition-all" style={{ width: progress + '%' }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{c.current.toLocaleString()} / {c.target.toLocaleString()} {c.unit}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {liveChallenges.map((c: any) => {
                const Icon = ICON_MAP[c.icon] || Target;
                const progress = Math.min(Math.round((c.current / c.target) * 100), 100);
                const deadline = new Date(c.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                          </div>
                          {c.badge && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 shrink-0">
                              <Award className="w-3 h-3" /> {c.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">{c.current.toLocaleString()} / {c.target.toLocaleString()} {c.unit}</span>
                            <span className="font-bold text-[#2D5F3F]">{progress}%</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#2D5F3F] to-[#4a8f5e] rounded-full transition-all duration-1000" style={{ width: progress + '%' }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                          <span>Deadline: {deadline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {liveChallenges.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No challenge data available yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}