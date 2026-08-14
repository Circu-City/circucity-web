import { CategoryPage } from '@/components/products/CategoryPage';
import { Shirt } from 'lucide-react';

interface SearchParams {
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    inStock?: string;
}

export default async function SustainableFashionPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;

    return (
        <CategoryPage
            categorySlug="sustainable-fashion"
            categoryName="Sustainable Fashion"
            description="Look good, feel good, do good. Discover ethically-made clothing and accessories from sustainable materials. Fashion that doesn't cost the Earth."
            icon={<Shirt className="w-10 h-10" />}
            searchParams={searchParams}
        />
    );
}
