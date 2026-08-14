"use client";

import { useEffect, useState } from "react";
import { Building2, Check, Circle, FileCheck2, Loader2, MapPin, Send, ShieldCheck, Store } from "lucide-react";
import { toast } from "sonner";

type VerificationData = {
  sellerType: "PRIVATE" | "BUSINESS";
  legalName: string | null;
  organizationNumber: string | null;
  website: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  categoryFocus: string[] | null;
  returnPolicy: string | null;
  verificationStatus: string;
  verificationRejectionReason: string | null;
  businessRegistrationVerified: boolean;
  addressVerified: boolean;
  managerIdentityVerified: boolean;
  returnPolicyApproved: boolean;
  liveListingCount: number;
};

const emptyForm = {
  legalName: "",
  organizationNumber: "",
  website: "",
  address: "",
  postalCode: "",
  city: "",
  categoryFocus: "",
  returnPolicy: "",
};

export default function SellerVerificationPage() {
  const [data, setData] = useState<VerificationData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const response = await fetch("/api/shop/verification");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load verification");
    setData(result);
    setForm({
      legalName: result.legalName || "",
      organizationNumber: result.organizationNumber || "",
      website: result.website || "",
      address: result.address || "",
      postalCode: result.postalCode || "",
      city: result.city || "",
      categoryFocus: Array.isArray(result.categoryFocus) ? result.categoryFocus.join(", ") : "",
      returnPolicy: result.returnPolicy || "",
    });
  };

  useEffect(() => {
    load().catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/shop/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryFocus: form.categoryFocus.split(",").map((value) => value.trim()).filter(Boolean).slice(0, 3),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile");
      toast.success("Verification profile saved");
      await load();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const saved = await save();
      if (!saved) return;
      const response = await fetch("/api/shop/verification", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit application");
      toast.success("Verification application submitted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#2D5F3F]" /></div>;
  }

  const submitted = ["SUBMITTED", "UNDER_REVIEW"].includes(data.verificationStatus);
  const verified = data.verificationStatus === "VERIFIED";
  const checklist = [
    { label: "Business registration confirmed", complete: data.businessRegistrationVerified, icon: Building2 },
    { label: "Physical store address confirmed", complete: data.addressVerified, icon: MapPin },
    { label: "Store manager identity confirmed", complete: data.managerIdentityVerified, icon: ShieldCheck },
    { label: "At least 5 approved live listings", complete: data.liveListingCount >= 5, icon: Store },
    { label: "Return policy approved", complete: data.returnPolicyApproved, icon: FileCheck2 },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-[#173D2A] text-white shadow-xl">
        <div className="grid gap-8 p-7 md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#F4D35E]">CircuCity trust programme</p>
            <h1 className="text-3xl font-black tracking-tight">Verified Store Profile</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100">Complete the partner checks to earn the Verified Partner badge, strengthen buyer trust, and receive a search ranking boost.</p>
          </div>
          <div className="flex items-center">
            <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${verified ? "bg-[#F4D35E] text-[#173D2A]" : submitted ? "bg-blue-100 text-blue-800" : "bg-white/10 text-white"}`}>
              {data.verificationStatus.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {data.sellerType !== "BUSINESS" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Verified Partner applications currently require a Business seller profile. Contact support if you are a registered charity.
        </div>
      )}
      {data.verificationStatus === "REJECTED" && data.verificationRejectionReason && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><strong>Review note:</strong> {data.verificationRejectionReason}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div><h2 className="text-lg font-bold text-gray-900">Partner details</h2><p className="text-sm text-gray-500">Changes after approval trigger a new review.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Legal business name" value={form.legalName} onChange={(value) => setForm({ ...form, legalName: value })} />
            <Field label="Swedish organisation number" value={form.organizationNumber} onChange={(value) => setForm({ ...form, organizationNumber: value })} />
            <Field label="Website (optional)" value={form.website} onChange={(value) => setForm({ ...form, website: value })} placeholder="https://example.se" />
            <Field label="Category focus (up to 3)" value={form.categoryFocus} onChange={(value) => setForm({ ...form, categoryFocus: value })} placeholder="Furniture, Fashion, Books" />
            <div className="md:col-span-2"><Field label="Physical store address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} /></div>
            <Field label="Postal code" value={form.postalCode} onChange={(value) => setForm({ ...form, postalCode: value })} />
            <Field label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Return policy</label>
            <textarea rows={7} maxLength={5000} value={form.returnPolicy} onChange={(event) => setForm({ ...form, returnPolicy: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#2D5F3F]" placeholder="Explain returns, exchanges, time limits, and item-condition requirements." />
          </div>
          <button onClick={save} disabled={saving || submitted} className="rounded-xl border border-[#2D5F3F] px-5 py-2.5 text-sm font-bold text-[#2D5F3F] hover:bg-green-50 disabled:opacity-50">
            {saving ? "Saving..." : "Save details"}
          </button>
        </section>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Verification checklist</h2>
          <p className="mt-1 text-sm text-gray-500">CircuCity reviews each trust signal before issuing a badge.</p>
          <div className="mt-5 space-y-3">
            {checklist.map(({ label, complete, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <span className={`mt-0.5 rounded-full p-1 ${complete ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{complete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}</span>
                <span className="text-sm font-medium text-gray-700">{label}{label.includes("5 approved") && <span className="block text-xs font-normal text-gray-500">{data.liveListingCount}/5 complete</span>}</span>
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={submitting || submitted || verified || data.sellerType !== "BUSINESS"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4D35E] px-4 py-3 text-sm font-black text-[#173D2A] hover:bg-[#e9c63e] disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : verified ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {verified ? "Verification complete" : submitted ? "Application under review" : "Submit for verification"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2D5F3F]" /></div>;
}
