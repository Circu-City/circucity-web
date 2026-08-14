import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PromoBanners() {
    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#E3E3E3] rounded-[30px] p-8 md:p-12 flex items-center relative overflow-hidden min-h-[450px]">
                        <div className="relative z-10 max-w-[60%] flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#F4D35E] text-[#2D5F3F] font-bold px-4 py-2 rounded-[80px] inline-flex items-center justify-center text-[15px] w-fit">
                                    Flat 20% Discount
                                </div>
                                <h3 className="text-4xl md:text-[48px] font-black text-neutral-900 leading-tight">
                                    Sustainable<br />Fashion
                                </h3>
                            </div>
                            <div className="flex flex-col gap-8">
                                <p className="text-gray-500 text-[18px] leading-[28px] max-w-md">
                                    Ethically made clothing using organic cotton and recycled materials.
                                </p>
                                <Link
                                    href="/products?category=Sustainable%20Fashion"
                                    prefetch
                                    className="inline-flex items-center justify-center gap-2 w-[276px] h-[67px] bg-[#2D5F3F] text-white rounded-[60px] font-bold text-[18px] hover:bg-[#1a3a28] transition-all hover:shadow-lg"
                                >
                                    Shop Now<ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="absolute right-[-100px] top-[-50px] bottom-[-50px] w-[60%] pointer-events-none">
                            <img src="/banner-fashion.png" alt="Sustainable Fashion" className="h-full w-full object-contain object-center scale-125" />
                        </div>
                    </div>

                    <div className="bg-[#F4D35E] rounded-[30px] p-8 md:p-12 flex items-center relative overflow-hidden min-h-[450px]">
                        <div className="relative z-10 max-w-[60%] flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#2D5F3F] text-[#F4D35E] font-bold px-4 py-2 rounded-[80px] inline-flex items-center justify-center text-[15px] w-fit">
                                    Flat 20% Discount
                                </div>
                                <h3 className="text-4xl md:text-[48px] font-black text-[#2D5F3F] leading-tight">
                                    Organic<br />Soap
                                </h3>
                            </div>
                            <div className="flex flex-col gap-8">
                                <p className="text-[#2D5F3F]/70 text-[18px] leading-[28px] max-w-md">
                                    Zero-waste essentials for a cleaner, smoother healthy skin.
                                </p>
                                <Link
                                    href="/products?category=Skincare"
                                    prefetch
                                    className="inline-flex items-center justify-center gap-2 w-[276px] h-[67px] bg-[#2D5F3F] text-white rounded-[60px] font-bold text-[18px] hover:bg-[#1a3a28] transition-all hover:shadow-lg"
                                >
                                    Shop Now<ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="absolute right-[-100px] top-[-50px] bottom-[-50px] w-[60%] pointer-events-none">
                            <img src="/banner-soap.png" alt="Organic Soap" className="h-full w-full object-contain object-center scale-125" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
