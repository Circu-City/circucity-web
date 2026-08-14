import { CategoryPage } from '@/components/products/CategoryPage';
import { Smartphone } from 'lucide-react';

interface SearchParams {
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    inStock?: string;
}

export default async function GreenGadgetsPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;

    return (
        <CategoryPage
            categorySlug="green-gadgets"
            categoryName="Green Gadgets"
            description="Explore innovative eco-friendly technology and gadgets. Solar chargers, energy-efficient devices, and sustainable tech solutions for the modern environmentalist."
            icon={<Smartphone className="w-10 h-10" />}
            searchParams={searchParams}
        />
    );
}
