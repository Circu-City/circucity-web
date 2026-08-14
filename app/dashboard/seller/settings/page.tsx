"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, User, Bell, CreditCard, Upload, Loader2, Camera, Globe, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";

const TABS = [
  { id: "profile", label: "Profile", icon: Store },
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SellerSettingsPage() {
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", website: "", location: "", logo: "",
    email: "", shopId: "", emailNotifications: true, orderUpdates: true, swapProposals: true, newsletter: false,
    bankName: "", accountHolder: "", clearingNumber: "", accountNumber: "", swiftIban: "",
  });

  const [payoutSaving, setPayoutSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/shop/settings").then(r => r.json()).catch(() => ({})),
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
    ]).then(([shop, me]) => {
      setForm(prev => ({
        ...prev,
        shopId: shop.id || "",
        name: shop.name || "",
        description: shop.description || "",
        location: me.location || "",
        logo: shop.logo || "",
        email: me.email || "",
        bankName: shop.bankName || "",
        accountHolder: shop.accountHolder || "",
        clearingNumber: shop.clearingNumber || "",
        accountNumber: shop.accountNumber || "",
        swiftIban: shop.swiftIban || "",
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/shop/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { toast.success("Settings saved!"); router.refresh(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleSavePayout = async () => {
    setPayoutSaving(true);
    try {
      const res = await fetch("/api/shop/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: form.bankName, accountHolder: form.accountHolder,
          clearingNumber: form.clearingNumber, accountNumber: form.accountNumber,
          swiftIban: form.swiftIban,
        }),
      });
      if (res.ok) { toast.success("Payout method saved!"); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Failed"); }
    finally { setPayoutSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store profile, account, and preferences.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#2D5F3F] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a3a28] disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-white text-[#2D5F3F] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Store Profile</h2>
            <p className="text-sm text-gray-500">Customize how your store appears to customers.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#2D5F3F] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {form.logo ? <img src={form.logo} className="w-full h-full object-cover" /> : (form.name?.charAt(0)?.toUpperCase() || "S")}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-500" />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Store Logo</p>
              <p className="text-xs text-gray-400 mt-1">Recommended size: 400x400px, JPG or PNG.</p>
              <label className="inline-block mt-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-50">
                <Upload className="w-3 h-3 inline mr-1" /> Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5"><Store className="w-3.5 h-3.5 inline mr-1" /> Store Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" placeholder="My Eco Store" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5"><FileText className="w-3.5 h-3.5 inline mr-1" /> Bio / Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm resize-none"
              placeholder="We sell sustainable, ethically sourced products for a greener lifestyle." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><Globe className="w-3.5 h-3.5 inline mr-1" /> Website</label>
              <input type="text" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" placeholder="https://mystore.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Location</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" placeholder="Skellefteå, Sweden" />
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Account Details</h2>
            <p className="text-sm text-gray-500">Your personal account information.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={form.email} disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Change Password</label>
            <p className="text-xs text-gray-400 mb-3">Passwords and account settings are managed through your secure account portal.</p>
            <button onClick={() => openUserProfile()} className="inline-block px-4 py-2 bg-[#2D5F3F] text-white rounded-lg text-sm font-bold hover:bg-[#1a3a28]">Manage Account</button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
            <p className="text-sm text-gray-500">Choose which notifications you receive.</p>
          </div>
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates and alerts via email" },
            { key: "orderUpdates", label: "Order Updates", desc: "Get notified when orders are placed or updated" },
            { key: "swapProposals", label: "Swap Proposals", desc: "Get notified when someone proposes a swap" },
            { key: "newsletter", label: "Newsletter", desc: "Sustainability tips and product recommendations" },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={(form as any)[item.key]} onChange={e => setForm(f => ({...f, [item.key]: e.target.checked}))}
                className="w-4 h-4 rounded border-gray-300 text-[#2D5F3F]" />
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Billing & Payouts</h2>
            <p className="text-sm text-gray-500">Configure how you receive payouts. You keep 100% of your listed price.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500">Account Status</p>
              <p className="font-bold text-green-600">Active</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-gray-500">Commission</p>
              <p className="font-bold text-blue-600">0% (You keep 100%)</p>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-700">Payout Method</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
              <input type="text" placeholder="e.g. Swedbank, SEB, Handelsbanken" value={form.bankName} onChange={e => setForm(f => ({...f, bankName: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Holder Name</label>
              <input type="text" placeholder="Name on bank account" value={form.accountHolder} onChange={e => setForm(f => ({...f, accountHolder: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Clearing Number</label>
                <input type="text" placeholder="XXXX" value={form.clearingNumber} onChange={e => setForm(f => ({...f, clearingNumber: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input type="text" placeholder="XXXXXXXXX" value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SWIFT / IBAN</label>
              <input type="text" placeholder="Optional" value={form.swiftIban} onChange={e => setForm(f => ({...f, swiftIban: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm" />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">How payouts work</p>
            <p className="text-sm text-gray-700">When a buyer confirms delivery of your item, the sale amount is added to your payout balance. Payouts are processed weekly and sent to your configured bank account.</p>
          </div>

          <button className="w-full py-3 rounded-xl bg-[#2D5F3F] text-white font-bold hover:bg-[#1a3a28] disabled:opacity-50 flex items-center justify-center gap-2" onClick={handleSavePayout} disabled={payoutSaving}>
            {payoutSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {payoutSaving ? "Saving..." : "Save Payout Method"}
          </button>
        </div>
      )}

      {/* Save Button (bottom) */}
      {activeTab === "profile" && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#2D5F3F] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1a3a28] disabled:opacity-50 shadow-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}
    </div>
  );
}
