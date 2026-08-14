import { Shirt, Sparkles, Home, Zap, Recycle } from 'lucide-react';
import Link from 'next/link';

const categories = [
    { name: 'Sustainable Fashion', icon: Shirt, route: '/products?category=Sustainable%20Fashion', color: 'bg-[#FDF8E4]', textColor: 'text-[#D4A373]', ringColor: 'ring-[#FDF8E4]' },
    { name: 'Skincare', icon: Sparkles, route: '/products?category=Skincare', color: 'bg-[#FCEAE8]', textColor: 'text-[#E07A5F]', ringColor: 'ring-[#FCEAE8]' },
    { name: 'Eco Home', icon: Home, route: '/products?category=Eco%20Home', color: 'bg-[#E8F4F8]', textColor: 'text-[#3D5A80]', ringColor: 'ring-[#E8F4F8]' },
    { name: 'Green Gadgets', icon: Zap, route: '/products?category=Green%20Gadgets', color: 'bg-[#F4E8F8]', textColor: 'text-[#815C94]', ringColor: 'ring-[#F4E8F8]' },
    { name: 'Recycled Items', icon: Recycle, route: '/products?category=Recycled%20Items', color: 'bg-[#E8F8F5]', textColor: 'text-[#1ABC9C]', ringColor: 'ring-[#E8F8F5]' },
];

export function Categories() {
    return (
        <section className="py-20 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Shop By Category</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {categories.map((category) => (
                        <Link
                            href={category.route}
                            prefetch
                            key={category.name}
                            className="flex flex-col items-center gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
                        >
                            <div className={`w-20 h-20 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:ring-4 ${category.ringColor} transition-all duration-300 ease-out`}>
                                <category.icon className={`w-8 h-8 ${category.textColor} transition-transform duration-300 group-hover:rotate-3`} />
                            </div>
                            <span className="font-bold text-neutral-900 text-center text-sm group-hover:text-[#2D5F3F] transition-colors duration-200">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
