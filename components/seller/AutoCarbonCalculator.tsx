
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AutoCarbonCalculatorProps {
    category: string;
    initialWeight?: string;
    onCalculationComplete: (footprint: string, saved: string) => void;
}

export function AutoCarbonCalculator({
    name,
    description,
    category,
    price,
    weight,
    onCalculationComplete
}: {
    name?: string,
    description?: string,
    category: string,
    price?: string,
    weight?: string,
    onCalculationComplete: (footprint: string, saved: string) => void
}) {
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        const handleCalculation = async () => {
            if (!name || !category || !weight) return;

            setCalculating(true);
            try {
                const res = await fetch('/api/carbon/estimate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, category, price, weight })
                });

                const data = await res.json();

                if (!data.error) {
                    const newFootprint = `${data.footprint.toFixed(2)} ${data.unit}`;
                    const newSaved = data.saved.toFixed(2);
                    onCalculationComplete(newFootprint, newSaved);
                }
            } catch (error) {
                console.error("Calculation failed", error);
            } finally {
                setCalculating(false);
            }
        };

        const timer = setTimeout(() => {
            if (name && category && weight) {
                handleCalculation();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [name, category, price, weight, onCalculationComplete]);

    if (!calculating) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-green-600 mb-2 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Calculating impact...
        </div>
    );
}
