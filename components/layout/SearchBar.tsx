'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Package, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any>({ products: [], categories: [] });
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);
    const timer = useRef<any>(null);

    useEffect(() => {
        const handleClick = (e: any) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchSuggestions = (q: string) => {
        if (q.length < 2) { setSuggestions({ products: [], categories: [] }); return; }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(q)}`)
                .then(r => r.json())
                .then(d => { setSuggestions(d); setOpen(true); })
                .catch(() => {});
        }, 150);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        fetchSuggestions(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
        setOpen(false);
    };

    const hasResults = suggestions.products?.length > 0 || suggestions.categories?.length > 0;

    return (
        <div ref={ref} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSubmit}>
                <Input type="search" placeholder="Search eco-friendly products..." value={query}
                    onChange={handleChange} onFocus={() => { if (hasResults) setOpen(true); }}
                    className="w-full pl-10 bg-background border-input rounded-full focus-visible:ring-primary" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </form>

            {open && hasResults && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {suggestions.products?.length > 0 && (
                        <div className="p-3">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Products</p>
                            {suggestions.products.map((p: any) => (
                                <Link key={p.id} href={`/products/${p.id}`} onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-300 m-auto mt-2.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#2D5F3F] transition-colors">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.category} · {p.price} kr</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    {suggestions.categories?.length > 0 && (
                        <div className="p-3 border-t border-gray-50">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Categories</p>
                            <div className="flex flex-wrap gap-2 px-2">
                                {suggestions.categories.map((c: string) => (
                                    <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} onClick={() => setOpen(false)}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#E7F0E9] text-gray-700 hover:text-[#2D5F3F] rounded-full text-xs font-medium transition-colors">{c}</Link>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="p-2 border-t border-gray-50 flex gap-2">
                        <button onClick={() => { router.push(`/products?search=${encodeURIComponent(query)}`); setOpen(false); }}
                            className="flex-1 text-center py-2 text-sm text-[#2D5F3F] font-semibold hover:bg-gray-50 rounded-xl transition-colors">
                            Search for "{query}"
                        </button>
                        <button onClick={() => { (document.querySelector('[data-rag-chat-trigger]') as HTMLButtonElement)?.click(); setOpen(false); }}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-[#2D5F3F] font-semibold bg-lemon-green/10 hover:bg-lemon-green/20 rounded-xl transition-colors">
                            <Bot className="w-4 h-4" /> Ask AI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
