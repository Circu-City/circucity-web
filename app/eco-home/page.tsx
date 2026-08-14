import { CategoryPage } from '@/components/products/CategoryPage';
import { Home } from 'lucide-react';

interface SearchParams {
    minPrice?: string;
    maxPrice?: string;
    condition?: string | string[];
    minCo2?: string;
    maxCo2?: string;
    inStock?: string;
}

export default async function EcoHomePage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;

    return (
        <CategoryPage
            categorySlug="eco-home"
            categoryName="Eco Home"
            description="Transform your living space with sustainable home products. From bamboo kitchenware to energy-efficient appliances, create an eco-friendly home you'll love."
            icon={<Home className="w-10 h-10" />}
            searchParams={searchParams}
        />
    );
}
