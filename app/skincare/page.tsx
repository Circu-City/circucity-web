import { CategoryPage } from '@/components/products/CategoryPage';
import { Sparkles } from 'lucide-react';

interface SearchParams {
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    inStock?: string;
}

export default async function SkincarePage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;

    return (
        <CategoryPage
            categorySlug="skincare"
            categoryName="Skincare"
            description="Pamper your skin with natural, cruelty-free skincare products. From organic moisturizers to eco-friendly cleansers, find everything for your sustainable beauty routine."
            icon={<Sparkles className="w-10 h-10" />}
            searchParams={searchParams}
        />
    );
}
