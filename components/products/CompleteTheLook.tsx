import { ProductCard } from "./ProductCard";
import type { ProductWithCategory } from "@/lib/complementary-pairings";

type SerializedProduct = Omit<ProductWithCategory, "price" | "co2Saved" | "weight"> & {
    price: number;
    co2Saved: number | null;
    weight: number | null;
};

const SECTION_COPY: Record<string, { heading: string; subtitle: string }> = {
    "Sustainable Fashion": {
        heading: "Complete the Look",
        subtitle: "Pairs well with what you're viewing",
    },
};
const DEFAULT_COPY = {
    heading: "Goes Well With This",
    subtitle: "Pairs well with what you're viewing",
};

interface CompleteTheLookProps {
    categoryName: string;
    products: SerializedProduct[];
}

export function CompleteTheLook({ categoryName, products }: CompleteTheLookProps) {
    if (products.length < 2) return null;

    const copy = SECTION_COPY[categoryName] || DEFAULT_COPY;

    return (
        <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 font-serif">{copy.heading}</h2>
            <p className="text-sm text-gray-500 mb-8">{copy.subtitle}</p>
            {/* Secondary section: horizontal scroll on mobile (3-4 per roll, not the page
                focus), normal 4-column grid from lg up. */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0 lg:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="w-[30%] min-w-[130px] max-w-[200px] shrink-0 snap-start lg:w-auto lg:min-w-0 lg:max-w-none animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
