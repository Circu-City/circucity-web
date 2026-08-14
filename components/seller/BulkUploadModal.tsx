'use client';

import { useState, useRef } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UploadResult = {
  success?: boolean;
  created?: number;
  total?: number;
  products?: { id: string; name: string; price: number }[];
  errors?: { row: number; field: string; message: string }[];
  error?: string;
};

export function BulkUploadModal({ shopId, onClose }: { shopId: string; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/bulk-upload', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: 'Upload failed. Check your connection.' }); }
    finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bulk Upload Products</h2>
            <p className="text-xs text-gray-500">Import multiple products from a CSV file</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-4">
          {!result && (
            <>
              <a href="/api/bulk-upload/template" download className="inline-flex items-center gap-2 text-sm text-[#2D5F3F] font-medium hover:underline">
                <Download className="w-4 h-4" /> Download CSV Template
              </a>

              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="font-semibold text-gray-600 mb-1">Required columns:</p>
                <code className="text-[#2D5F3F]">name, price</code>
                <p className="mt-2 font-semibold text-gray-600 mb-1">Optional columns:</p>
                <code className="text-gray-600">description, category, stock, weight, image_url, co2_saved</code>
              </div>

              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-[#2D5F3F] hover:bg-green-50/30 transition-colors"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2"><FileText className="w-5 h-5 text-[#2D5F3F]" /><span className="font-medium text-gray-900">{file.name}</span><span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span></div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Click to select CSV file</p>
                    <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              </div>

              <Button onClick={handleUpload} disabled={!file || uploading}
                className="w-full bg-[#2D5F3F] hover:bg-[#1a3a28] text-white font-semibold py-6 rounded-xl text-base">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importing...</> : <>Upload &amp; Import Products</>}
              </Button>
            </>
          )}

          {result && (
            <div className="space-y-4">
              {result.success !== undefined ? (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">
                        {result.created ?? 0} of {result.total ?? 0} products imported
                      </p>
                      <p className="text-xs text-green-600">Restart your shop to see changes</p>
                    </div>
                  </div>

                  {result.products && result.products.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                      {result.products.map(p => (
                        <div key={p.id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                          <span className="text-gray-700 truncate">{p.name}</span>
                          <span className="font-medium text-gray-900 ml-2">{p.price} kr</span>
                        </div>
                      ))}
                      {result.created && result.created > 10 && <p className="text-xs text-gray-400 mt-1">...and {result.created - 10} more</p>}
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      <p className="font-semibold">Skipped rows:</p>
                      {result.errors.slice(0, 5).map((e, i) => (
                        <p key={i}>Row {e.row}: {e.field} — {e.message}</p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="font-bold text-red-800 text-sm">{result.error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => { setResult(null); setFile(null); }}
                  className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl">Upload Another</Button>
                <Button onClick={onClose}
                  className="flex-1 bg-[#2D5F3F] hover:bg-[#1a3a28] text-white rounded-xl">Done</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
