'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Check, CheckCircle2, Globe2, Images, Leaf, Loader2, RefreshCw, Sparkles, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { AutoCarbonCalculator } from '@/components/seller/AutoCarbonCalculator';
import { getCategories } from '@/app/actions/category';

type DraftStatus = 'queued' | 'uploading' | 'analyzing' | 'review' | 'publishing' | 'published' | 'error';
type ListingDraft = {
  id: string;
  previewUrl: string;
  imageUrl: string;
  status: DraftStatus;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  price: string;
  weight: string;
  footprint: string;
  co2Saved: string;
  priceGrounded: boolean;
  attributes: Record<string, string>;
  rawResponse?: unknown;
  reviewed: boolean;
  error?: string;
};

const conditionLabels = { new: 'New', like_new: 'Like new', good: 'Good', fair: 'Fair', poor: 'Poor' } as const;
const conditionValues = { new: 'NEW', like_new: 'LIKE_NEW', good: 'GOOD', fair: 'FAIR', poor: 'POOR' } as const;

async function prepareAnalysisImage(file: File): Promise<string> {
  try {
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return '';
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
}

export default function BulkAiListingPage() {
  const { getToken } = useAuth();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [publishingAll, setPublishingAll] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const updateDraft = (id: string, update: Partial<ListingDraft>) => {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...update } : draft));
  };

  const analyseFile = async (id: string, file: File) => {
    try {
      updateDraft(id, { status: 'uploading', error: undefined });
      const analysisImage = await prepareAnalysisImage(file);
      if (!analysisImage) throw new Error('This image could not be prepared for AI analysis. Try JPEG, PNG, or WEBP.');

      const formData = new FormData();
      formData.append('file', file, file.name);
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadText = await uploadResponse.text();
      let upload: { url?: string; error?: string } = {};
      try { upload = JSON.parse(uploadText); } catch { /* Proxy errors may return HTML. */ }
      if (uploadResponse.status === 413) throw new Error('This photo is too large. Use an image smaller than 10 MB.');
      if (!uploadResponse.ok || !upload.url) throw new Error(upload.error || 'Image upload failed');

      updateDraft(id, { status: 'analyzing', imageUrl: upload.url });
      const analysisResponse = await fetch('/api/listings/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: analysisImage }),
      });
      const analysis = await analysisResponse.json();
      if (!analysisResponse.ok) throw new Error(analysis.error || 'AI analysis failed');

      updateDraft(id, {
        status: 'review',
        title: analysis.title || 'Second-hand item',
        description: analysis.description || '',
        category: analysis.category || 'General',
        condition: analysis.condition || 'good',
        price: String(analysis.suggestedPriceSek || ''),
        weight: String(analysis.estimatedWeightKg || '0.5'),
        priceGrounded: Boolean(analysis.priceGrounded),
        attributes: analysis.attributes || {},
        rawResponse: analysis.rawResponse,
      });
    } catch (error) {
      updateDraft(id, { status: 'error', error: error instanceof Error ? error.message : 'Processing failed' });
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = Array.from(files).filter((file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024);
    if (accepted.length !== files.length) toast.error('Some files were skipped. Images must be 10 MB or smaller.');
    const additions = accepted.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      imageUrl: '',
      status: 'queued' as const,
      title: '',
      description: '',
      category: '',
      condition: 'good' as const,
      price: '',
      weight: '0.5',
      footprint: '-',
      co2Saved: '0',
      priceGrounded: false,
      attributes: {},
      reviewed: false,
      file,
    }));
    setDrafts((current) => [...additions.map(({ file: _file, ...draft }) => draft), ...current]);
    additions.forEach(({ id, file }) => void analyseFile(id, file));
  };

  const removeDraft = (draft: ListingDraft) => {
    URL.revokeObjectURL(draft.previewUrl);
    setDrafts((current) => current.filter((item) => item.id !== draft.id));
  };

  const publishDraft = async (draft: ListingDraft) => {
    if (!draft.reviewed) throw new Error(`Review and confirm “${draft.title || 'this item'}” first.`);
    if (!draft.title.trim() || !draft.description.trim() || !draft.category.trim() || !draft.price || Number(draft.price) <= 0) {
      throw new Error(`Complete all listing fields for “${draft.title || 'this item'}”.`);
    }
    updateDraft(draft.id, { status: 'publishing', error: undefined });
    const token = await getToken();
    if (!token) {
      updateDraft(draft.id, { status: 'review', error: 'Your session expired. Sign in again and retry.' });
      throw new Error('Your session expired. Sign in again and retry.');
    }
    const body: Record<string, unknown> = {
      name: draft.title.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      inventory: 1,
      category: draft.category.trim(),
      condition: conditionValues[draft.condition],
      imageUrl: draft.imageUrl,
      aiRawResponse: draft.rawResponse,
      aiSuggestedPriceSek: Number(draft.price),
      attributes: draft.attributes,
      co2Saved: parseFloat(draft.co2Saved) || 0,
    };
    if (draft.weight && Number(draft.weight) > 0) body.weight = Number(draft.weight);
    const response = await fetch('/api/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      updateDraft(draft.id, { status: 'review', error: result.message || 'Publishing failed' });
      throw new Error(result.message || 'Publishing failed');
    }
    updateDraft(draft.id, { status: 'published' });
  };

  const publishOne = async (draft: ListingDraft) => {
    try {
      await publishDraft(draft);
      toast.success(`${draft.title} published`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publishing failed');
    }
  };

  const publishAll = async () => {
    const ready = drafts.filter((draft) => draft.status === 'review' && draft.reviewed);
    if (!ready.length) return toast.error('Review and confirm at least one listing.');
    setPublishingAll(true);
    let published = 0;
    for (const draft of ready) {
      try { await publishDraft(draft); published++; } catch { /* each failed draft retains its error */ }
    }
    setPublishingAll(false);
    if (published) toast.success(`${published} listing${published === 1 ? '' : 's'} published`);
    if (published !== ready.length) toast.error(`${ready.length - published} listing${ready.length - published === 1 ? '' : 's'} could not be published`);
  };

  const processingCount = drafts.filter((draft) => ['queued', 'uploading', 'analyzing'].includes(draft.status)).length;
  const readyCount = drafts.filter((draft) => draft.status === 'review').length;
  const confirmedCount = drafts.filter((draft) => draft.status === 'review' && draft.reviewed).length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/seller/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#2D5F3F]"><ArrowLeft className="h-4 w-4" /> Back to products</Link>
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#C39D22]">Camera-to-catalogue</p><h1 className="mt-1 text-3xl font-black text-gray-900">Bulk AI Listing</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Take one photo per item. You can keep capturing while AI analyses the queue in the background. Every draft must be reviewed before publishing.</p></div>
          {confirmedCount > 0 && <button onClick={publishAll} disabled={publishingAll} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] px-5 py-3 text-sm font-bold text-white hover:bg-[#1a3a28] disabled:opacity-50">{publishingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Publish confirmed ({confirmedCount})</button>}
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl bg-[#173D2A] text-white shadow-xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div><div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3"><Camera className="h-8 w-8 text-[#F4D35E]" /></div><h2 className="text-2xl font-black">Photograph the next item</h2><p className="mt-2 text-sm text-green-100">Use your rear camera for the best result. Keep the full item visible in even light.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[360px]">
            <button onClick={() => cameraRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-[#F4D35E] px-5 py-4 font-black text-[#173D2A] hover:bg-[#e8c53d]"><Camera className="h-7 w-7" /> Open camera</button>
            <button onClick={() => galleryRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 font-bold text-white hover:bg-white/15"><Images className="h-7 w-7" /> Select photos</button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
            <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
          </div>
        </div>
      </section>

      {drafts.length > 0 && <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{drafts.length} captured</span><span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{processingCount} processing</span><span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">{readyCount} awaiting review</span></div>}

      {drafts.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 text-center"><Camera className="mx-auto h-12 w-12 text-gray-300" /><h2 className="mt-4 text-lg font-bold text-gray-800">No items captured yet</h2><p className="mt-1 text-sm text-gray-500">Tap Open camera to start your listing queue.</p></div>
      ) : (
        <div className="space-y-5">
          {drafts.map((draft, index) => <DraftCard key={draft.id} draft={draft} index={drafts.length - index} categories={categories} update={(update) => updateDraft(draft.id, update)} remove={() => removeDraft(draft)} retry={() => toast.error('Remove this item and capture it again.')} publish={() => publishOne(draft)} />)}
        </div>
      )}
    </div>
  );
}

function DraftCard({ draft, index, categories, update, remove, retry, publish }: { draft: ListingDraft; index: number; categories: { id: string; name: string }[]; update: (value: Partial<ListingDraft>) => void; remove: () => void; retry: () => void; publish: () => void }) {
  const processing = ['queued', 'uploading', 'analyzing'].includes(draft.status);
  const matchedCategory = categories.find((cat) => cat.name.toLowerCase() === draft.category.toLowerCase());
  const categorySelectValue = matchedCategory ? matchedCategory.name : '';
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative min-h-56 bg-gray-100"><img src={draft.previewUrl} alt="Captured product" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white">Item {index}</span><button onClick={remove} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white" aria-label="Remove item"><Trash2 className="h-4 w-4" /></button></div>
        <div className="p-5 md:p-6">
          {processing && <div className="flex min-h-48 flex-col items-center justify-center text-center"><Loader2 className="h-8 w-8 animate-spin text-[#2D5F3F]" /><p className="mt-3 font-bold text-gray-800">{draft.status === 'uploading' ? 'Uploading original photo...' : 'AI is building the listing...'}</p><p className="mt-1 text-xs text-gray-500">You can take the next photo now.</p></div>}
          {draft.status === 'error' && <div className="flex min-h-48 flex-col items-center justify-center text-center"><XCircle className="h-9 w-9 text-red-500" /><p className="mt-3 font-bold text-red-700">Could not process this item</p><p className="mt-1 max-w-md text-sm text-gray-500">{draft.error}</p><button onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold"><RefreshCw className="h-4 w-4" /> Try another photo</button></div>}
          {draft.status === 'published' && <div className="flex min-h-48 flex-col items-center justify-center text-center"><CheckCircle2 className="h-10 w-10 text-green-600" /><p className="mt-3 text-lg font-black text-green-800">Published</p><p className="text-sm text-gray-500">{draft.title} is live in the marketplace.</p></div>}
          {['review', 'publishing'].includes(draft.status) && <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-black text-[#2D5F3F]"><Sparkles className="h-4 w-4" /> AI draft — review required</div>
              <div className="flex items-center gap-2">
                {draft.priceGrounded && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700"><Globe2 className="h-3 w-3" /> Price checked online</span>}
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Not live yet</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Title" value={draft.title} maxLength={80} onChange={(title) => update({ title, reviewed: false })} /><Field label="Price (SEK)" value={draft.price} type="number" onChange={(price) => update({ price, reviewed: false })} /></div>
            <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Description</label><textarea value={draft.description} maxLength={300} rows={3} onChange={(event) => update({ description: event.target.value, reviewed: false })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F]" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Category</label>
                <select value={categorySelectValue} onChange={(event) => update({ category: event.target.value, reviewed: false })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F]">
                  <option value="" disabled>{draft.category ? `AI suggested "${draft.category}" — pick a category` : 'Select category'}</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <Field label="Weight (kg)" value={draft.weight} type="number" step="0.1" onChange={(weight) => update({ weight, reviewed: false })} />
              <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Condition</label><select value={draft.condition} onChange={(event) => update({ condition: event.target.value as ListingDraft['condition'], reviewed: false })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">{Object.entries(conditionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-800"><Leaf className="h-4 w-4" /> Carbon impact</h3>
              <AutoCarbonCalculator
                category={draft.category}
                name={draft.title}
                description={draft.description}
                price={draft.price}
                weight={draft.weight}
                onCalculationComplete={(fp, co2) => update({ footprint: fp, co2Saved: co2 })}
              />
              <p className="mt-2 text-sm font-bold text-green-900">{parseFloat(draft.co2Saved) > 0 ? `${draft.co2Saved} kg CO2e saved` : 'Calculating from weight and category…'}</p>
            </div>
            <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center"><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-900"><input type="checkbox" checked={draft.reviewed} onChange={(event) => update({ reviewed: event.target.checked })} className="h-5 w-5 accent-[#2D5F3F]" /> I reviewed this listing and confirm it is accurate</label><button onClick={publish} disabled={!draft.reviewed || draft.status === 'publishing'} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">{draft.status === 'publishing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Publish item</button></div>
            {draft.error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{draft.error}</p>}
          </div>}
        </div>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, type = 'text', maxLength, step }: { label: string; value: string; onChange: (value: string) => void; type?: string; maxLength?: number; step?: string }) {
  return <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</label><input type={type} value={value} maxLength={maxLength} step={step} min={type === 'number' ? 0 : undefined} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F]" /></div>;
}
