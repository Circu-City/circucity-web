'use client';

import { Globe, Bell, Shield, Settings, Key, Webhook, Save, Bot, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | 'unknown'>('unknown');
    const [workspaceKey, setWorkspaceKey] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [chatbotEnabled, setChatbotEnabled] = useState(false);
    const [stripeKey, setStripeKey] = useState('');
    const [postnordKey, setPostnordKey] = useState('');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(d => {
                if (d.success && d.data) {
                    const ai = d.data['ai-assistant'] || {};
                    if (ai.apiKey) setWorkspaceKey(ai.apiKey);
                    if (ai.workspaceId) setWorkspaceId(ai.workspaceId);
                    if (ai.enabled !== undefined) setChatbotEnabled(ai.enabled === 'true');
                    const sec = d.data.security || {};
                    if (sec.stripeKey) setStripeKey(sec.stripeKey);
                    if (sec.postnordKey) setPostnordKey(sec.postnordKey);
                    const integ = d.data.integrations || {};
                    if (integ.openrouterKey) setOpenrouterKey(integ.openrouterKey);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (section: string, data: Record<string, string>) => {
        setSaving(section);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, ...data }),
            });
            const result = await res.json().catch(() => ({}));
            if (res.ok && result.success) toast.success(`${section} settings saved`);
            else toast.error(result.error || 'Failed to save');
        } catch { toast.error('Network error'); }
        finally { setSaving(null); }
    };

    const handleTestConnection = async () => {
        setTesting(true); setConnectionStatus('testing');
        try {
            const res = await fetch('/api/rag/verify', {
                method: 'POST', headers: { 'x-api-key': workspaceKey },
            });
            const data = await res.json();
            if (data.status === 'connected') {
                setConnectionStatus('connected');
                toast.success(`Connected to ${data.name} (${data.workspace_id})`);
            } else {
                setConnectionStatus('disconnected');
                toast.error('Connection failed');
            }
        } catch {
            setConnectionStatus('disconnected');
            toast.error('Network error');
        }
        finally { setTesting(false); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Settings</h1>
                <p className="text-sm text-gray-500">Platform configuration and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#E7F0E9] rounded-xl"><Globe className="w-5 h-5 text-[#2D5F3F]" /></div>
                        <div><h3 className="font-bold text-lg text-neutral-900">General</h3><p className="text-xs text-gray-500">Site name and domain settings.</p></div>
                    </div>
                    <div className="space-y-3">
                        <Input defaultValue="CircuCity" placeholder="Site Name" />
                        <Input defaultValue="circucity.com" placeholder="Domain" />
                        <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1a3a28]" onClick={() => handleSave('general', { siteName: 'CircuCity', domain: 'circucity.com' })} disabled={saving === 'general'}>
                            {saving === 'general' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#FDF8E4] rounded-xl"><Bell className="w-5 h-5 text-[#D4A373]" /></div>
                        <div><h3 className="font-bold text-lg text-neutral-900">Notifications</h3><p className="text-xs text-gray-500">Email and notification settings.</p></div>
                    </div>
                    <div className="space-y-3">
                        <Input defaultValue="orders@circucity.com" placeholder="From Email" />
                        <Input defaultValue="Resend API Key" placeholder="Resend API Key" type="password" />
                        <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1a3a28]" onClick={() => handleSave('notifications', {})} disabled={saving === 'notifications'}>
                            {saving === 'notifications' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#E8F8F5] rounded-xl"><Shield className="w-5 h-5 text-[#1ABC9C]" /></div>
                        <div><h3 className="font-bold text-lg text-neutral-900">Security</h3><p className="text-xs text-gray-500">API keys and access controls.</p></div>
                    </div>
                    <div className="space-y-3">
                        <Input value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="Stripe Secret Key" type="password" />
                        <Input value={postnordKey} onChange={e => setPostnordKey(e.target.value)} placeholder="PostNord API Key" type="password" />
                        <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1a3a28]" onClick={() => handleSave('security', { stripeKey, postnordKey })} disabled={saving === 'security'}>
                            {saving === 'security' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#F4E8F8] rounded-xl"><Settings className="w-5 h-5 text-[#815C94]" /></div>
                        <div><h3 className="font-bold text-lg text-neutral-900">Integrations</h3><p className="text-xs text-gray-500">Webhooks and third-party services.</p></div>
                    </div>
                    <div className="space-y-3">
                        <Input value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)} placeholder="OpenRouter API Key" type="password" />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Webhook className="w-4 h-4" />
                            <span className="truncate">Clerk: /api/webhooks/clerk</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-medium">Live</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Webhook className="w-4 h-4" />
                            <span className="truncate">Stripe: /api/webhooks/stripe</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-medium">Live</span>
                        </div>
                        <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1a3a28]" onClick={() => handleSave('integrations', { openrouterKey })} disabled={saving === 'integrations'}>
                            {saving === 'integrations' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#E7F0E9] rounded-xl"><Bot className="w-5 h-5 text-[#2D5F3F]" /></div>
                        <div><h3 className="font-bold text-lg text-neutral-900">AI Assistant Settings</h3><p className="text-xs text-gray-500">Connect your CircuCity AI workspace for chatbot integration.</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Workspace API Key</label>
                            <Input placeholder="cc_live_xxxxxxxxxxxxx" value={workspaceKey} onChange={e => setWorkspaceKey(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Workspace ID</label>
                            <Input value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} placeholder="ws_xxxxxxxxxxxxx" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-xs ${connectionStatus === 'connected' ? 'text-green-600' : connectionStatus === 'testing' ? 'text-blue-600' : connectionStatus === 'unknown' ? 'text-gray-500' : 'text-red-600'}`}>
                            {connectionStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : connectionStatus === 'unknown' ? null : <CheckCircle className="w-3 h-3" />}
                            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'testing' ? 'Testing...' : connectionStatus === 'unknown' ? 'Not tested' : 'Disconnected'}
                        </span>
                        <span className="text-xs text-gray-400">via chatbot.circucity.com</span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                            <input type="checkbox" checked={chatbotEnabled} onChange={e => setChatbotEnabled(e.target.checked)} className="rounded border-gray-300" />
                            Enable chatbot on website
                        </label>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1a3a28]" onClick={() => handleSave('ai-assistant', { apiKey: workspaceKey, workspaceId, enabled: chatbotEnabled ? 'true' : 'false' })} disabled={saving === 'ai-assistant'}>
                            {saving === 'ai-assistant' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleTestConnection} disabled={testing}>
                            {testing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                            Test Connection
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
