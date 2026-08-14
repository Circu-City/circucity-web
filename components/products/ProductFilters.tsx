'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface ProductFiltersProps {
    categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialCategories = searchParams.getAll('category');
    const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
    const initialMaxPrice = Number(searchParams.get('maxPrice')) || 1000;

    const initialCondition = searchParams.getAll('condition');
    const initialMinCo2 = Number(searchParams.get('minCo2')) || 0;
    const initialMaxCo2 = Number(searchParams.get('maxCo2')) || 15;

    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
    const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>(initialCondition);
    const [co2Range, setCo2Range] = useState<[number, number]>([initialMinCo2, initialMaxCo2]);

    // Handle updates
    const applyFilters = useDebouncedCallback((
        newCategories: string[],
        newPriceRange: [number, number],
        newConditions: string[],
        newCo2Range: [number, number]
    ) => {
        const params = new URLSearchParams(searchParams.toString());

        // Update categories
        params.delete('category');
        newCategories.forEach(cat => params.append('category', cat));

        // Update price
        if (newPriceRange[0] > 0) params.set('minPrice', newPriceRange[0].toString());
        else params.delete('minPrice');

        if (newPriceRange[1] < 1000) params.set('maxPrice', newPriceRange[1].toString());
        else params.delete('maxPrice');

        // Update condition
        params.delete('condition');
        newConditions.forEach(cond => params.append('condition', cond));

        // Update CO2
        if (newCo2Range[0] > 0) params.set('minCo2', newCo2Range[0].toString());
        else params.delete('minCo2');

        if (newCo2Range[1] < 15) params.set('maxCo2', newCo2Range[1].toString());
        else params.delete('maxCo2');

        router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    // Sync state with URL changes (back/forward)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedCategories(searchParams.getAll('category'));
        setPriceRange([
            Number(searchParams.get('minPrice')) || 0,
            Number(searchParams.get('maxPrice')) || 1000
        ]);
        setSelectedConditions(searchParams.getAll('condition'));
        setCo2Range([
            Number(searchParams.get('minCo2')) || 0,
            Number(searchParams.get('maxCo2')) || 15
        ]);
    }, [searchParams]);

    const handleCategoryChange = (checked: boolean, categoryName: string) => {
        const nextCategories = checked
            ? [...selectedCategories, categoryName]
            : selectedCategories.filter((c) => c !== categoryName);

        setSelectedCategories(nextCategories);
        applyFilters(nextCategories, priceRange, selectedConditions, co2Range);
    };

    const handlePriceChange = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]];
        setPriceRange(newRange);
        applyFilters(selectedCategories, newRange, selectedConditions, co2Range);
    };

    const handleConditionChange = (checked: boolean, condition: string) => {
        const nextConditions = checked
            ? [...selectedConditions, condition]
            : selectedConditions.filter((c) => c !== condition);

        setSelectedConditions(nextConditions);
        applyFilters(selectedCategories, priceRange, nextConditions, co2Range);
    };

    const handleCo2Change = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]];
        setCo2Range(newRange);
        applyFilters(selectedCategories, priceRange, selectedConditions, newRange);
    };


    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 1000]);
        setSelectedConditions([]);
        setCo2Range([0, 15]);
        router.push('/products');
    };

    const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000 || selectedConditions.length > 0 || co2Range[0] > 0;

    return (
        <>
            {/* Desktop Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0 pr-8 border-r border-gray-100 min-h-screen">
                <div className="sticky top-24">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                        <Filter className="w-5 h-5" />
                        <h2>Filters</h2>
                    </div>
                    <FilterContent
                        categories={categories}
                        selectedCategories={selectedCategories}
                        handleCategoryChange={handleCategoryChange}
                        priceRange={priceRange}
                        handlePriceChange={handlePriceChange}
                        selectedConditions={selectedConditions}
                        handleConditionChange={handleConditionChange}
                        co2Range={co2Range}
                        handleCo2Change={handleCo2Change}
                        hasActiveFilters={hasActiveFilters}
                        clearFilters={clearFilters}
                    />
                </div>
            </div>

            {/* Mobile Filters Trigger */}
            <div className="lg:hidden mb-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                                <Filter className="w-4 h-4" /> Filters
                            </span>
                            {hasActiveFilters && (
                                <span className="bg-[#2D5F3F] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    Active
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <div className="mt-6">
                            <FilterContent
                                categories={categories}
                                selectedCategories={selectedCategories}
                                handleCategoryChange={handleCategoryChange}
                                priceRange={priceRange}
                                handlePriceChange={handlePriceChange}
                                selectedConditions={selectedConditions}
                                handleConditionChange={handleConditionChange}
                                co2Range={co2Range}
                                handleCo2Change={handleCo2Change}
                                hasActiveFilters={hasActiveFilters}
                                clearFilters={clearFilters}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

interface FilterContentProps {
    categories: Category[];
    selectedCategories: string[];
    handleCategoryChange: (checked: boolean, categoryName: string) => void;
    priceRange: [number, number];
    handlePriceChange: (value: number[]) => void;
    selectedConditions: string[];
    handleConditionChange: (checked: boolean, condition: string) => void;
    co2Range: [number, number];
    handleCo2Change: (value: number[]) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

function FilterContent({
    categories,
    selectedCategories,
    handleCategoryChange,
    priceRange,
    handlePriceChange,
    selectedConditions,
    handleConditionChange,
    co2Range,
    handleCo2Change,
    hasActiveFilters,
    clearFilters
}: FilterContentProps) {
    return (
        <div className="space-y-8">
            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Category</h3>
                <div className="space-y-3">
                    {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-3 group">
                            <Checkbox
                                id={category.id}
                                checked={selectedCategories.includes(category.name)}
                                onCheckedChange={(checked) => handleCategoryChange(checked as boolean, category.name)}
                                className="border-gray-300 data-[state=checked]:bg-[#2D5F3F] data-[state=checked]:border-[#2D5F3F] transition-colors"
                            />
                            <Label
                                htmlFor={category.id}
                                className="text-sm text-gray-600 group-hover:text-[#2D5F3F] cursor-pointer font-medium transition-colors"
                            >
                                {category.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Price Range</h3>
                <div className="px-1">
                    <Slider
                        defaultValue={[0, 1000]}
                        value={[priceRange[0], priceRange[1]]}
                        max={1000}
                        step={10}
                        minStepsBetweenThumbs={1}
                        onValueChange={handlePriceChange}
                        className="my-6"
                    />
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-md min-w-[60px] text-center shadow-sm">
                        <span className="text-xs text-gray-400 block text-left">Min</span>
                        {priceRange[0]} kr
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-md min-w-[60px] text-center shadow-sm">
                        <span className="text-xs text-gray-400 block text-left">Max</span>
                        {priceRange[1]} kr+
                    </div>
                </div>
            </div>

            {/* Condition */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Condition</h3>
                <div className="space-y-3">
                    {['NEW', 'LIKE_NEW', 'REFURBISHED'].map((condition) => (
                        <div key={condition} className="flex items-center space-x-3 group">
                            <Checkbox
                                id={condition}
                                checked={selectedConditions.includes(condition)}
                                onCheckedChange={(checked) => handleConditionChange(checked as boolean, condition)}
                                className="border-gray-300 data-[state=checked]:bg-[#2D5F3F] data-[state=checked]:border-[#2D5F3F] transition-colors"
                            />
                            <Label
                                htmlFor={condition}
                                className="text-sm text-gray-600 group-hover:text-[#2D5F3F] cursor-pointer font-medium transition-colors"
                            >
                                {condition.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* CO2 Saved */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">CO₂ Saved (kg)</h3>
                <div className="px-1">
                    <Slider
                        defaultValue={[0, 15]}
                        value={[co2Range[0], co2Range[1]]}
                        max={15}
                        step={0.5}
                        minStepsBetweenThumbs={1}
                        onValueChange={handleCo2Change}
                        className="my-6 [&>.relative>.absolute]:bg-[#F4D35E]"
                    />
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                    <span className="text-gray-600">{co2Range[0]}kg</span>
                    <span className="text-gray-600">{co2Range[1]}kg+</span>
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-sm h-9"
                    onClick={clearFilters}
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    );
}
