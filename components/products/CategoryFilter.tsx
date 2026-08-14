'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface CategoryFilterProps {
    categorySlug: string;
}

export function CategoryFilter({ categorySlug }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
    const initialMaxPrice = Number(searchParams.get('maxPrice')) || 1000;
    const initialCondition = searchParams.getAll('condition');
    const initialMinCo2 = Number(searchParams.get('minCo2')) || 0;
    const initialMaxCo2 = Number(searchParams.get('maxCo2')) || 15;
    const initialInStock = searchParams.get('inStock') === 'true';

    const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>(initialCondition);
    const [co2Range, setCo2Range] = useState<[number, number]>([initialMinCo2, initialMaxCo2]);
    const [inStockOnly, setInStockOnly] = useState(initialInStock);

    const conditions = [
        { id: 'NEW', label: 'New' },
        { id: 'LIKE_NEW', label: 'Like New' },
        { id: 'REFURBISHED', label: 'Refurbished' }
    ];

    // Apply filters with debouncing
    const applyFilters = useDebouncedCallback((
        newPriceRange: [number, number],
        newConditions: string[],
        newCo2Range: [number, number],
        newInStock: boolean
    ) => {
        const params = new URLSearchParams(searchParams.toString());

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

        // Update in stock
        if (newInStock) params.set('inStock', 'true');
        else params.delete('inStock');

        router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    // Sync state with URL changes (back/forward)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPriceRange([
            Number(searchParams.get('minPrice')) || 0,
            Number(searchParams.get('maxPrice')) || 1000
        ]);
        setSelectedConditions(searchParams.getAll('condition'));
        setCo2Range([
            Number(searchParams.get('minCo2')) || 0,
            Number(searchParams.get('maxCo2')) || 15
        ]);
        setInStockOnly(searchParams.get('inStock') === 'true');
    }, [searchParams]);

    const handlePriceChange = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]];
        setPriceRange(newRange);
        applyFilters(newRange, selectedConditions, co2Range, inStockOnly);
    };

    const handleConditionChange = (checked: boolean, condition: string) => {
        const nextConditions = checked
            ? [...selectedConditions, condition]
            : selectedConditions.filter((c) => c !== condition);

        setSelectedConditions(nextConditions);
        applyFilters(priceRange, nextConditions, co2Range, inStockOnly);
    };

    const handleCo2Change = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]];
        setCo2Range(newRange);
        applyFilters(priceRange, selectedConditions, newRange, inStockOnly);
    };

    const handleInStockChange = (checked: boolean) => {
        setInStockOnly(checked);
        applyFilters(priceRange, selectedConditions, co2Range, checked);
    };

    const handleReset = () => {
        setPriceRange([0, 1000]);
        setSelectedConditions([]);
        setCo2Range([0, 15]);
        setInStockOnly(false);
        router.push(`/${categorySlug}`, { scroll: false });
    };

    return (
        <div className="space-y-6">
            {/* Price Range */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>

            {/* Condition */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
                <div className="space-y-2">
                    {conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={condition.id}
                                checked={selectedConditions.includes(condition.id)}
                                onCheckedChange={(checked) => handleConditionChange(checked as boolean, condition.id)}
                            />
                            <Label
                                htmlFor={condition.id}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {condition.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* CO2 Saved */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">CO₂ Saved (kg)</h3>
                <Slider
                    min={0}
                    max={15}
                    step={0.5}
                    value={co2Range}
                    onValueChange={handleCo2Change}
                    className="mb-2 [&>.relative>.absolute]:bg-[#F4D35E]"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>{co2Range[0]}kg</span>
                    <span>{co2Range[1]}kg+</span>
                </div>
            </div>

            {/* Availability */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="in-stock"
                        checked={inStockOnly}
                        onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
                    />
                    <Label
                        htmlFor="in-stock"
                        className="text-sm font-normal cursor-pointer"
                    >
                        In Stock Only
                    </Label>
                </div>
            </div>

            {/* Reset Button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
            >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Filters
            </Button>
        </div>
    );
}
