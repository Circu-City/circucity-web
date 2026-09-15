'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Page navigation used to be <button onClick={router.push}>. That works for a
// person and is invisible to a crawler: nothing in the HTML pointed at page 2,
// so only the first 12 products on /products (and on every category page) were
// ever discoverable. The page controls are real links now. The rows-per-page
// select stays a client control -- it's a preference, not a page.
export function PaginationControls({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Preserve the active filters/sort; only the page changes.
    const hrefFor = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) params.delete('page'); else params.set('page', String(page));
        const qs = params.toString();
        return qs ? `?${qs}` : '?';
    };

    const handleLimitChange = (limit: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('limit', limit);
        params.delete('page');
        router.push(`?${params.toString()}`);
    };

    // Compact window of numbered links: always first and last, and up to two
    // either side of the current page. Gaps render as an ellipsis.
    const numbered: Array<number | '…'> = [];
    if (totalPages <= 7) {
        for (let p = 1; p <= totalPages; p++) numbered.push(p);
    } else {
        const lo = Math.max(2, currentPage - 2);
        const hi = Math.min(totalPages - 1, currentPage + 2);
        numbered.push(1);
        if (lo > 2) numbered.push('…');
        for (let p = lo; p <= hi; p++) numbered.push(p);
        if (hi < totalPages - 1) numbered.push('…');
        numbered.push(totalPages);
    }

    const iconBtn = 'h-8 w-8 p-0';
    const isFirst = currentPage <= 1;
    const isLast = currentPage >= totalPages;

    return (
        <nav aria-label="Pagination" className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2 py-4">
            <div className="flex-1 text-sm text-gray-700">
                {totalItems > 0 ? (
                    <>
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> results
                    </>
                ) : (
                    'No results found'
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select value={`${itemsPerPage}`} onValueChange={handleLimitChange}>
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((limit) => (
                                <SelectItem key={limit} value={`${limit}`}>
                                    {limit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-1">
                    {isFirst ? (
                        <Button variant="outline" className={iconBtn} disabled aria-label="First page"><ChevronsLeft className="h-4 w-4" /></Button>
                    ) : (
                        <Button asChild variant="outline" className={iconBtn}>
                            <Link href={hrefFor(1)} aria-label="First page"><ChevronsLeft className="h-4 w-4" /></Link>
                        </Button>
                    )}
                    {isFirst ? (
                        <Button variant="outline" className={iconBtn} disabled aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
                    ) : (
                        <Button asChild variant="outline" className={iconBtn}>
                            <Link href={hrefFor(currentPage - 1)} rel="prev" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Link>
                        </Button>
                    )}

                    <ol className="flex items-center gap-1 mx-1 text-sm font-medium">
                        {numbered.map((p, i) =>
                            p === '…' ? (
                                <li key={`gap-${i}`} className="px-1 text-gray-400" aria-hidden="true">…</li>
                            ) : p === currentPage ? (
                                <li key={p}>
                                    <span aria-current="page" className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#2D5F3F] px-2 text-white">{p}</span>
                                </li>
                            ) : (
                                <li key={p}>
                                    <Link href={hrefFor(p)} className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-gray-200 px-2 hover:bg-gray-50" aria-label={`Page ${p}`}>{p}</Link>
                                </li>
                            )
                        )}
                    </ol>

                    {isLast ? (
                        <Button variant="outline" className={iconBtn} disabled aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
                    ) : (
                        <Button asChild variant="outline" className={iconBtn}>
                            <Link href={hrefFor(currentPage + 1)} rel="next" aria-label="Next page"><ChevronRight className="h-4 w-4" /></Link>
                        </Button>
                    )}
                    {isLast ? (
                        <Button variant="outline" className={iconBtn} disabled aria-label="Last page"><ChevronsRight className="h-4 w-4" /></Button>
                    ) : (
                        <Button asChild variant="outline" className={iconBtn}>
                            <Link href={hrefFor(totalPages)} aria-label="Last page"><ChevronsRight className="h-4 w-4" /></Link>
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}
