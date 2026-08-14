"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { Leaf, Store, Users } from "lucide-react";
import { registerShop } from "../actions/shop";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);
    const [sellerType, setSellerType] = useState<"PRIVATE" | "BUSINESS">("PRIVATE");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await registerShop(formData);

            if (result) {
                if (result.success) {
                    if (result.redirectUrl) {
                        router.push(result.redirectUrl);
                    }
                } else {
                    alert(result.message);
                    if (result.redirectUrl) {
                        router.push(result.redirectUrl);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role === 'SELLER') {
            router.push('/dashboard/seller');
        }
    }, [isLoaded, user, router]);

    if (!isLoaded) return <div>Loading...</div>;

    if (user?.publicMetadata?.role === 'SELLER') {
        return <div className="min-h-screen flex items-center justify-center bg-[#fcf9f2]">Redirecting to your dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left Column: Text & Features */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h2 className="text-4xl font-extrabold text-[#2D5F3F] mb-4">
                            Become a CircuCity Seller
                        </h2>
                        <p className="text-lg text-gray-600">
                            Join the world's fastest-growing eco-friendly marketplace.
                            Turn your sustainable passion into a thriving business.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Feature 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#fae8b4] flex items-center justify-center text-[#2D5F3F]">
                                <Store className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#2D5F3F]">Dedicated Storefront</h3>
                                <p className="text-gray-600">Customize your shop, manage inventory, and tell your brand's story.</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#fae8b4] flex items-center justify-center text-[#2D5F3F]">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#2D5F3F]">Reach Conscious Consumers</h3>
                                <p className="text-gray-600">Connect directly with millions of shoppers who care about the planet.</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#fae8b4] flex items-center justify-center text-[#2D5F3F]">
                                <Leaf className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#2D5F3F]">Impact Tracking</h3>
                                <p className="text-gray-600">Showcase your environmental impact with our built-in carbon footprint tools.</p>
                            </div>
                        </div>
                    </div>

                    {/* Did you know box */}
                    <div className="bg-[#2D5F3F] rounded-xl p-8 text-white relative overflow-hidden">
                        <h4 className="text-xl font-bold mb-2 relative z-10">Did you know?</h4>
                        <p className="text-gray-200 relative z-10">
                            Sellers on CircuCity see an average of <span className="font-bold">40% growth</span> in their first 3 months.
                        </p>
                    </div>
                </div>

                {/* Right Column: Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-[#2D5F3F] py-10 px-8 text-center">
                        <div className="mx-auto flex justify-center mb-6">
                            <Store className="h-20 w-20 text-[#F4D35E]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">Create Shop</h3>
                        <p className="text-[#aebcb6]">Start your journey today.</p>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Shop Name
                                </label>
                                <Input
                                    id="shopName"
                                    name="shopName"
                                    type="text"
                                    required
                                    placeholder={sellerType === "BUSINESS" ? "e.g. Green Earth Goods AB" : "e.g. Green Earth Goods"}
                                    className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Seller Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${sellerType === 'PRIVATE' ? 'border-[#2D5F3F] bg-[#f8f5f2]' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setSellerType('PRIVATE')}
                                    >
                                        <div className="font-bold text-[#2D5F3F]">Private Seller</div>
                                        <div className="text-xs text-gray-500 mt-1">Selling personal second-hand items</div>
                                    </div>
                                    <div
                                        className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${sellerType === 'BUSINESS' ? 'border-[#2D5F3F] bg-[#f8f5f2]' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setSellerType('BUSINESS')}
                                    >
                                        <div className="font-bold text-[#2D5F3F]">Business Seller</div>
                                        <div className="text-xs text-gray-500 mt-1">Registered company</div>
                                    </div>
                                </div>
                                <input type="hidden" name="sellerType" value={sellerType} />
                            </div>

                            {sellerType === 'BUSINESS' && (
                                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-[#2D5F3F] text-sm">Business Details</h4>
                                    <div>
                                        <label htmlFor="organizationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Organization Number
                                        </label>
                                        <Input
                                            id="organizationNumber"
                                            name="organizationNumber"
                                            type="text"
                                            required={sellerType === 'BUSINESS'}
                                            placeholder="e.g. 556000-0000"
                                            className="bg-white border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Shop Description
                                </label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    required
                                    placeholder="What makes your products sustainable?"
                                    className="bg-gray-50 border-gray-200 focus:ring-[#2D5F3F] focus:border-[#2D5F3F]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 bg-[#F4D35E] hover:bg-[#eac040] text-[#2D5F3F] font-bold text-lg rounded-xl transition-colors"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Shop"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
