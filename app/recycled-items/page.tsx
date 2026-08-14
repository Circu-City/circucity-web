import { CategoryPage } from '@/components/products/CategoryPage';
import { Recycle } from 'lucide-react';

interface SearchParams {
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    inStock?: string;
}

export default async function RecycledItemsPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;

    return (
        <CategoryPage
            categorySlug="recycled-items"
            categoryName="Recycled Items"
            description="Give new life to recycled materials. Browse unique products made from upcycled and recycled materials, reducing waste and supporting circular economy."
            icon={<Recycle className="w-10 h-10" />}
            searchParams={searchParams}
        />
    );
}
