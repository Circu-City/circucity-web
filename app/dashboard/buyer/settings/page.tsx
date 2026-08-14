"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, MapPin, Phone, Shield, Key, Bell, Globe, CreditCard, Building2, FileText,
  ChevronLeft, Save, Camera, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function BuyerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "Sweden",
    language: "en", currency: "SEK", notifications: true, newsletter: false,
    businessType: "individual", vatNumber: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
      fetch("/api/dashboard/overview", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
    ]).then(([me, overview]) => {
      setForm({
        name: me.name || me.user?.name || "",
        email: me.email || me.user?.email || "",
        phone: me.phone || "",
        address: me.billingAddress || overview.address || "",
        city: me.billingCity || overview.city || "Skellefteå",
        country: me.billingCountry || "SE",
        language: "en",
        currency: "SEK",
        notifications: true,
        newsletter: false,
        businessType: me.businessType || "individual",
        vatNumber: me.vatNumber || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSaved(true); toast.success("Settings saved!"); setTimeout(() => setSaved(false), 3000); }
      else toast.error("Failed to save settings");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) { toast.error("Fill in both password fields"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) { toast.success("Password changed!"); setCurrentPassword(""); setNewPassword(""); }
      else toast.error("Incorrect current password");
    } catch { toast.error("Failed to change password"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-2 border-[#2D5F3F] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#2D5F3F] flex items-center mb-2"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Link>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile, security, and preferences.</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saved ? 'bg-green-100 text-green-700' : 'bg-[#2D5F3F] text-white hover:bg-[#1a3a28]'
            }`}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</>}
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#2D5F3F]" /> Profile Information</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5F3F] to-[#4a8f5e] flex items-center justify-center text-white text-3xl font-bold">
                {form.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"><Camera className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{form.name}</p>
              <p className="text-sm text-gray-500">{form.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+46 70 123 45 67"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Address</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street address"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm bg-white">
                <option value="SE">Sweden</option>
                <option value="DK">Denmark</option>
                <option value="NO">Norway</option>
                <option value="FI">Finland</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-[#2D5F3F]" /> Change Password</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm pr-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
            </div>
          </div>
          <button onClick={handlePasswordChange} disabled={saving} className="mt-4 px-5 py-2.5 rounded-xl bg-[#2D5F3F] text-white font-bold text-sm hover:bg-[#1a3a28] transition-colors">
            Update Password
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-[#2D5F3F]" /> Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm bg-white">
                <option value="en">English</option>
                <option value="sv">Svenska</option>
                <option value="da">Dansk</option>
                <option value="no">Norsk</option>
                <option value="fi">Suomi</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] outline-none text-sm bg-white">
                <option value="SEK">SEK (kr)</option>
                <option value="EUR">EUR (€)</option>
                <option value="DKK">DKK (kr)</option>
                <option value="NOK">NOK (kr)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifications} onChange={e => setForm({...form, notifications: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-[#2D5F3F] focus:ring-[#2D5F3F]" />
              <div><span className="text-sm font-medium text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Order Notifications</span><p className="text-xs text-gray-500">Receive updates about your orders and deliveries</p></div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.newsletter} onChange={e => setForm({...form, newsletter: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-[#2D5F3F] focus:ring-[#2D5F3F]" />
              <div><span className="text-sm font-medium text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Newsletter</span><p className="text-xs text-gray-500">Get sustainability tips and product recommendations</p></div>
            </label>
          </div>
        </div>

        {/* Billing & VAT Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#2D5F3F]" /> Billing & VAT</h2>
          <p className="text-sm text-gray-500 mb-4">Used for tax calculations on your purchases. EU business customers may qualify for reverse charge VAT.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
              <select value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm bg-white">
                <option value="individual">Individual / Consumer</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm bg-white">
                <option value="SE">Sweden</option>
                <option value="DK">Denmark</option>
                <option value="NO">Norway</option>
                <option value="FI">Finland</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>
          {form.businessType === "business" && form.country !== "NO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-gray-400" /> EU VAT Number</label>
              <input type="text" value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})}
                placeholder="SEXXXXXXXXXX" maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all text-sm" />
              <p className="text-xs text-gray-400 mt-1">Enter your EU VAT registration number for reverse charge eligibility.</p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button onClick={() => { if (confirm("Are you sure? This action cannot be undone.")) toast.error("Contact support@circucity.com to delete your account"); }}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-bold text-sm hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
