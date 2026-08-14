'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductState } from "@/app/actions/product";
import { Image as ImageIcon, XCircle } from 'lucide-react';
import Image from 'next/image';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/app/actions/category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WeightEstimationGuide } from '@/components/seller/WeightEstimationGuide';
import { AutoCarbonCalculator } from "@/components/seller/AutoCarbonCalculator";
import { formatPrice } from '@/lib/pricing';

const currencyStr = 'kr'; // SEK

type ProductFormProps = {
    action: (prevState: ProductState, formData: FormData) => Promise<ProductState>;
    initialData?: {
        name: string;
        description: string;
        price: number | string;
        inventory: number;
        weight?: number | null;
        category?: { name: string } | null;
        images: string[];
        status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "SOLD";
        co2Saved: number;
    };
    submitLabel: string;
    onSuccess?: () => void;
    redirectTo?: string;
};

const initialState: ProductState = {
    message: '',
};

export function ProductForm({ action, initialData, submitLabel, onSuccess, redirectTo }: ProductFormProps) {
    const [state, formAction, isPending] = useActionState(action, initialState);
    const [imageUrl, setImageUrl] = useState<string>(initialData?.images?.[0] || '');
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    // Controlled inputs state
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category?.name || "");
    const [selectedStatus, setSelectedStatus] = useState(initialData?.status || "ACTIVE");

    const router = useRouter();

    // Carbon Footprint State
    const [co2Saved, setCo2Saved] = useState(initialData?.co2Saved?.toString() || "0");
    const [footprint, setFootprint] = useState("-");

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                if (redirectTo) {
                    router.push(redirectTo);
                }
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(state.message);
            }
        }
    }, [state, redirectTo, onSuccess, router]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">

                {/* Product Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Bamboo Toothbrush"
                        className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Describe your product..."
                        className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F] min-h-[100px]"
                    />
                </div>

                {/* Price, Stock, Weight Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price ({currencyStr}) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="1"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            placeholder="100"
                            className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                        />
                        {/* Transparency Explanation */}
                        {price && !isNaN(parseFloat(price)) && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                <div className="flex justify-between font-bold text-[#2D5F3F]">
                                    <span>You Earn:</span>
                                    <span>{formatPrice(parseFloat(price))}</span>
                                </div>
                                <p className="mt-2 leading-tight">
                                    Buyers pay a <span className="font-semibold text-gray-700">Shield Fee</span> at checkout. You keep exactly what you list!
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-1">
                            Stock <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="inventory"
                            name="inventory"
                            type="number"
                            min="0"
                            defaultValue={initialData?.inventory}
                            required
                            placeholder="100"
                            className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                        />
                    </div>

                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                            Weight (kg) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="weight"
                            name="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            placeholder="0.5"
                            className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                        />
                        <WeightEstimationGuide onSelect={(w) => setWeight(w)} />
                    </div>
                </div>

                {/* Category & Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <Select
                            name="category"
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                            required
                        >
                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                                {categories.length === 0 && (
                                    <div className="p-2 text-sm text-gray-500 text-center">No categories found</div>
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="category" value={selectedCategory} />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <Select
                            name="status"
                            value={selectedStatus}
                            onValueChange={(val: any) => setSelectedStatus(val)}
                        >
                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className='bg-white'>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                <SelectItem value="SOLD">Sold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Carbon Footprint Calculation */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center mb-4">

                        <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Carbon Impact Calculation
                        </h3>
                    </div>

                    <AutoCarbonCalculator
                        name={name}
                        description={description}
                        category={selectedCategory}
                        price={price}
                        weight={weight}
                        onCalculationComplete={(footprint: string, saved: string) => {
                            setFootprint(footprint);
                            setCo2Saved(saved);
                        }}
                    />

                    <div className="flex flex-col sm:flex-row justify-between text-sm bg-white p-4 rounded-lg border border-green-100 shadow-sm gap-4">
                        <div>
                            <span className="text-gray-500 block text-xs mb-1">Estimated Footprint (New):</span>
                            <span className="font-bold text-gray-900 text-lg">{footprint}</span>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-green-600 block text-xs mb-1">Estimated CO2e Saved (Used):</span>
                            <span className="font-bold text-green-600 text-lg">{parseFloat(co2Saved) > 0 ? `${co2Saved} kg` : '-'}</span>
                        </div>
                    </div>
                    <input type="hidden" name="co2Saved" value={co2Saved} />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                    </label>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        {imageUrl ? (
                            <div className="relative w-full max-w-xs h-48 mb-4">
                                <img
                                    src={imageUrl}
                                    alt="Product Preview"
                                    className="object-contain rounded-lg w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 border border-gray-200"
                                >
                                    <XCircle className="h-6 w-6 text-red-500" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center mb-4 text-center cursor-pointer">
                                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                    <ImageIcon className="h-6 w-6 text-gray-500" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Click to upload product image</p>
                                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or WEBP (MAX. 8MB)</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => setImageUrl(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>

                {/* Error message block removed as it handles via toast now, or keep as persist error? */}
                {state?.message && !state.success && (
                    <div aria-live="polite" className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start">
                        <XCircle className="h-5 w-5 mr-2 shrink-0" />
                        {state.message}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3">
                {/* Can add Cancel button here if needed, but usually handled by layout or link */}
                <Button
                    type="submit"
                    className="bg-[#F4D35E] hover:bg-[#e6c235] text-[#2D5F3F] font-bold px-8"
                    disabled={isPending}
                >
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form >
    );
}
