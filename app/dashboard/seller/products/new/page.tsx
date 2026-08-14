'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, ChevronRight, ChevronLeft, Zap, Upload, X, ImageIcon, Leaf, TrendingDown } from 'lucide-react';
import { AutoCarbonCalculator } from "@/components/seller/AutoCarbonCalculator";
import { WeightEstimationGuide } from "@/components/seller/WeightEstimationGuide";

type CategoryData = { category: string; subcategories: string[]; attributes: Record<string, string[]> };
const CATEGORY_KEYWORDS: Record<string, CategoryData> = {
  phone: { category: 'Electronics', subcategories: ['Smartphones', 'Mobile Accessories'], attributes: { Brand: ['Apple','Samsung','Google','OnePlus'], Condition: ['New','Like New','Refurbished'], Storage: ['64GB','128GB','256GB','512GB'], Color: ['Black','White','Blue','Red'] } },
  iphone: { category: 'Electronics', subcategories: ['Smartphones'], attributes: { Brand: ['Apple'], Condition: ['New','Like New','Refurbished'], Storage: ['64GB','128GB','256GB','512GB','1TB'], Color: ['Black','White','Blue','Natural Titanium'] } },
  laptop: { category: 'Electronics', subcategories: ['Laptops','Computer Accessories'], attributes: { Brand: ['Apple','Dell','HP','Lenovo','ASUS'], Condition: ['New','Like New','Refurbished'], RAM: ['8GB','16GB','32GB'], Storage: ['256GB SSD','512GB SSD','1TB SSD'] } },
  shoe: { category: 'Sustainable Fashion', subcategories: ['Footwear','Athletic Shoes'], attributes: { Brand: ['Nike','Adidas','Puma','New Balance'], Size: ['38','39','40','41','42','43','44','45'], Condition: ['New','Like New','Pre-owned'], Color: ['Black','White','Navy','Grey'] } },
  shirt: { category: 'Sustainable Fashion', subcategories: ['T-Shirts','Casual Wear'], attributes: { Brand: ['H&M','Zara','Nike','Adidas'], Size: ['XS','S','M','L','XL','XXL'], Condition: ['New','Like New','Pre-owned'], Color: ['Black','White','Blue','Green','Red'] } },
  skincare: { category: 'Skincare', subcategories: ['Face Care','Body Care'], attributes: { Brand: ['The Ordinary','CeraVe','La Roche-Posay'], Type: ['Moisturizer','Serum','Cleanser','Sunscreen'], Size: ['30ml','50ml','100ml','200ml'] } },
  soap: { category: 'Skincare', subcategories: ['Body Care','Natural'], attributes: { Brand: ['Lush','Dr. Bronner','Local Brand'], Type: ['Bar','Liquid','Organic'], Size: ['100g','200g','500g'] } },
  gadget: { category: 'Green Gadgets', subcategories: ['Solar Powered','Energy Efficient'], attributes: { Brand: ['EcoFlow','Goal Zero','Anker'], Type: ['Charger','Light','Sensor'], Condition: ['New','Like New'] } },
  recycle: { category: 'Recycled Items', subcategories: ['Upcycled','Reclaimed'], attributes: { Material: ['Glass','Plastic','Metal','Wood'], Type: ['Decor','Furniture','Accessories'], Condition: ['Upcycled','Reclaimed'] } },
};

function analyzeTitle(title: string): { category: string; subcategories: string[]; attributes: Record<string, string[]>; tags: string[] } | null {
  const lower = title.toLowerCase();
  for (const [keyword, data] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      const tags: string[] = [keyword, data.category];
      Object.values(data.attributes).forEach(v => tags.push(...v.slice(0, 3)));
      return { ...data, tags: [...new Set(tags)] };
    }
  }
  const defaultAttrs = { Brand: ['—'], Condition: ['New','Like New','Refurbished'], Type: ['—'] };
  return { category: 'Eco Home', subcategories: ['General'], attributes: defaultAttrs, tags: ['product', 'eco'] };
}

export default function AddProductForm() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [inventory, setInventory] = useState('1');
  const [weight, setWeight] = useState('0.5');
  const [images, setImages] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [category, setCategory] = useState('');
  const [co2Saved, setCo2Saved] = useState("0");
  const [footprint, setFootprint] = useState("-");
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    setSubmitError('');
    if (!name.trim()) { setSubmitError('Product name is required'); return; }
    if (!price || parseFloat(price) <= 0) { setSubmitError('Please enter a valid price'); return; }
    if (!inventory || parseInt(inventory) <= 0) { setSubmitError('Please enter inventory quantity'); return; }

    setSubmitting(true);
    try {
      const conditionMap: Record<string, string> = {
        'New': 'NEW',
        'Like New': 'LIKE_NEW',
        'Refurbished': 'REFURBISHED',
        'Pre-owned': 'PRE_OWNED',
        'Used': 'USED',
        'Upcycled': 'UP_CYCLED',
        'Reclaimed': 'RECLAIMED',
      };
      const body: Record<string, any> = {
        name,
        description: description || `${name} - ${category || analysis?.category || 'Eco Home'}`,
        price: parseFloat(price),
        inventory: parseInt(inventory),
        category: category || analysis?.category || 'Eco Home',
        imageUrl: uploadedUrl || images.split(',')[0]?.trim() || '',
        co2Saved: parseFloat(co2Saved) || 0,
      };
      if (weight && parseFloat(weight) > 0) body.weight = parseFloat(weight);
      if (selectedAttrs.Condition && conditionMap[selectedAttrs.Condition]) {
        body.condition = conditionMap[selectedAttrs.Condition];
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok && res.status === 401) {
        setSubmitError('Your session expired. Please sign in again.');
        setSubmitting(false);
        return;
      }
      const text = await res.text();
      if (!text || text.length === 0) {
        setSubmitError('Server returned an empty response. Please try again.');
        setSubmitting(false);
        return;
      }
      let data;
      try { data = JSON.parse(text); } catch {
        const contentType = res.headers.get('content-type') || 'unknown';
        const isHtml = text.trim().startsWith('<');
        const preview = isHtml ? '(HTML page)' : text.slice(0, 200);
        const logData = { status: res.status, contentType, preview, isHtml };
        console.error('[Add Product] Invalid JSON:', JSON.stringify(logData));
        setSubmitError(`Server error (${res.status}). ${isHtml ? 'Your session may have expired. Please refresh and try again.' : 'Please try again.'}`);
        setSubmitting(false);
        return;
      }
      if (data.success) {
        router.push('/dashboard/seller/products');
      } else {
        setSubmitError(data.message || 'Failed to create product');
      }
    } catch (e) {
      console.error('[Add Product] Fetch error:', e);
      setSubmitError('Failed to create product. Please try again.');
    }
    setSubmitting(false);
  };

  const handleAnalyze = () => {
    if (!name.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = analyzeTitle(name);
      setAnalysis(result);
      setCategory(result?.category || 'Eco Home');
      setAnalyzing(false);
      setStep(2);
    }, 500);
  };

  const formatName = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-6">
          <Link href="/dashboard/seller/products" className="flex items-center text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Products</Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-[#2D5F3F] text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-[#2D5F3F]' : 'bg-gray-200'}`} />}
              {s === 1 && <span className="absolute mt-14 text-xs text-gray-500">Info</span>}
              {s === 2 && <span className="absolute mt-14 text-xs text-gray-500 ml-[-8px]">Analyze</span>}
              {s === 3 && <span className="absolute mt-14 text-xs text-gray-500 ml-[-12px]">Review</span>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Product Info */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Product Information</h2>
              <p className="text-gray-500 mb-6">Enter basic details and let AI do the rest.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. iPhone 15 Pro Max 256GB" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe your product..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (kr)</label>
                    <Input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="299" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                    <Input value={inventory} onChange={e => setInventory(e.target.value)} type="number" placeholder="10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight — used for CO₂ calculation</label>
                  <WeightEstimationGuide onSelect={(w: string) => setWeight(w)} />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">or enter manually:</span>
                    <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.1" placeholder="0.5" className="w-24" />
                    <span className="text-xs text-gray-400">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                  {uploadedUrl ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border mb-2">
                      <img src={uploadedUrl} alt="Product" className="w-full h-full object-cover" />
                      <button onClick={() => setUploadedUrl('')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ) : uploadingImage ? (
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <span className="animate-spin text-2xl mb-2">⟳</span>
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById('product-image-input')?.click()}
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload product image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (max 8MB)</p>
                      <input
                        id="product-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Image too large. Max 10MB.');
                            return;
                          }
                          setUploadingImage(true);
                          try {
                            // Compress image client-side to avoid server body size limits
                            const img = await createImageBitmap(file);
                            const canvas = document.createElement('canvas');
                            const maxDim = 1600;
                            let w = img.width, h = img.height;
                            if (w > maxDim || h > maxDim) {
                              if (w > h) { h = h * maxDim / w; w = maxDim; }
                              else { w = w * maxDim / h; h = maxDim; }
                            }
                            canvas.width = w; canvas.height = h;
                            const ctx = canvas.getContext('2d')!;
                            ctx.drawImage(img, 0, 0, w, h);
                            const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85));
                            img.close();

                            const formData = new FormData();
                            formData.append('file', blob, file.name.replace(/\.[^.]+$/, '.jpg'));
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            console.log('[Upload] Response status:', res.status);
                            const text = await res.text();
                            console.log('[Upload] Response body:', text.slice(0, 200));
                            let data;
                            try { data = JSON.parse(text); } catch {
                              console.error('[Upload] Invalid JSON:', text.slice(0, 200));
                              alert('Upload failed: server returned invalid response');
                              setUploadingImage(false);
                              return;
                            }
                            if (data.url) {
                              console.log('[Upload] Success:', data.url);
                              setUploadedUrl(data.url);
                            } else {
                              alert(data.error || 'Upload failed');
                            }
                          } catch (e) {
                            console.error('[Upload] Fetch error:', e);
                            alert('Upload failed: ' + (e?.message || 'unknown error'));
                          }
                          setUploadingImage(false);
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Or paste image URLs (comma separated):</p>
                  <Input value={images} onChange={e => setImages(e.target.value)} placeholder="https://..." />
                </div>
                <div className="pt-4">
                  <button onClick={handleAnalyze} disabled={!name.trim() || analyzing} className="w-full py-3.5 rounded-xl bg-[#2D5F3F] text-white font-bold hover:bg-[#1a3a28] disabled:opacity-50 flex items-center justify-center gap-2">
                    {analyzing ? <><span className="animate-spin">⟳</span> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Analyze with AI →</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: AI Analysis */}
          {step === 2 && analysis && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900">AI Analysis Results</h2>
              </div>
              <p className="text-gray-500 mb-6">Review and confirm the auto-detected information.</p>
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-purple-800 mb-1">Detected Category</p>
                  <p className="text-lg font-bold text-purple-900">{analysis.category} → {analysis.subcategories[0]}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                </div>

                {analysis && (
                  <div className="space-y-6">
                    {Object.keys(analysis.attributes || {}).map(attrName => {
                      const vals = (analysis.attributes as any)[attrName] || [];
                      return (
                        <div key={attrName}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{formatName(attrName)}</label>
                          <div className="flex flex-wrap gap-2">
                            {vals.map((v: string) => (
                              <button key={v} onClick={() => setSelectedAttrs({...selectedAttrs, [attrName]: v})}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedAttrs[attrName] === v ? 'bg-[#2D5F3F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{v}</button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"><ChevronLeft className="w-4 h-4 inline mr-1" /> Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#2D5F3F] text-white font-bold hover:bg-[#1a3a28]">Continue <ChevronRight className="w-4 h-4 inline ml-1" /></button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Review & Publish</h2>
              </div>
              <p className="text-gray-500 mb-6">Confirm your product details before publishing.</p>

              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium text-gray-900">{name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-medium text-gray-900">{price} kr</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{analysis?.category} → {analysis?.subcategories[0]}</span></div>
                {Object.entries(selectedAttrs).map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-gray-500">{formatName(k)}</span><span className="font-medium text-gray-900">{v}</span></div>
                ))}
                <div className="flex justify-between"><span className="text-gray-500">Inventory</span><span className="font-medium text-gray-900">{inventory}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-medium text-gray-900">{weight} kg</span></div>
              </div>

              {/* Carbon Impact */}
              <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Leaf className="w-5 h-5" /> Carbon Impact</h3>
                <AutoCarbonCalculator
                  category={category || analysis?.category || 'Eco Home'}
                  name={name}
                  weight={weight}
                  onCalculationComplete={(fp, co2) => { setFootprint(fp); setCo2Saved(co2); }}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">New Footprint</p>
                    <p className="text-lg font-bold text-gray-900">{footprint}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">CO₂ Saved (Used)</p>
                    <p className="text-lg font-bold text-green-600">{parseFloat(co2Saved) > 0 ? `${co2Saved} kg` : '—'}</p>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              <div className="flex gap-3 pt-6">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"><ChevronLeft className="w-4 h-4 inline mr-1" /> Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#2D5F3F] text-white font-bold hover:bg-[#1a3a28] disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <span className="animate-spin">⟳</span> : <Zap className="w-4 h-4" />}
                  {submitting ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
