
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableHeaderProps {
    column: string;
    label: string;
}

export function SortableHeader({ column, label }: SortableHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order');

    const handleSort = () => {
        const params = new URLSearchParams(searchParams.toString());

        let newOrder = 'desc';
        if (currentSort === column && currentOrder === 'desc') {
            newOrder = 'asc';
        }

        params.set('sort', column);
        params.set('order', newOrder);

        router.push(`?${params.toString()}`);
    };

    return (
        <Button
            variant="ghost"
            onClick={handleSort}
            className="-ml-4 h-8 data-[state=open]:bg-accent hover:bg-gray-100"
        >
            {label}
            {currentSort === column ? (
                currentOrder === 'desc' ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowUp className="ml-2 h-4 w-4" />
                )
            ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
}
