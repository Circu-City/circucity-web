import Link from 'next/link';
import { Sparkles, ArrowRight, ShoppingBag, Gift, Leaf, Trophy } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Eco Tokens - Earn Rewards | CircuCity',
    description: 'Earn Eco Tokens with every sustainable purchase. Redeem them for exclusive discounts and rewards.',
};

export default function EcoTokensPage() {
    return (
        <div className="min-h-screen bg-[#F5F0E6]">
            <section className="bg-gradient-to-br from-[#2D5F3F] via-[#2D5F3F] to-[#2d5a45] text-white py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                        <Sparkles className="w-4 h-4 text-[#F4D35E]" />
                        <span className="text-[#F4D35E] font-medium">Rewards Program</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Earn <span className="text-[#F4D35E]">Eco Tokens</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                        Every sustainable purchase earns you Eco Tokens. Save them up and redeem for exclusive discounts on future orders.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg">
                            Start Earning <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/leaderboard" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
                            View Leaderboard <Trophy className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">How It Works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: ShoppingBag, title: 'Shop Sustainably', desc: 'Every purchase of eco-friendly products earns you Eco Tokens based on the CO₂ saved.', color: 'bg-[#E7F0E9]', textColor: 'text-[#2D5F3F]' },
                            { icon: Sparkles, title: 'Collect & Grow', desc: 'Tokens accumulate in your account. The more you shop sustainably, the more you earn.', color: 'bg-[#FDF8E4]', textColor: 'text-[#D4A373]' },
                            { icon: Gift, title: 'Redeem Rewards', desc: 'Use your tokens for exclusive discounts, free shipping, and special offers.', color: 'bg-[#E8F8F5]', textColor: 'text-[#1ABC9C]' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <item.icon className={`w-7 h-7 ${item.textColor}`} />
                                </div>
                                <h3 className="font-bold text-xl text-neutral-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] rounded-[2rem] p-12 text-white">
                        <Leaf className="w-12 h-12 text-[#F4D35E] mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4">Your Impact Matters</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                            Every token represents real CO₂ saved. Join our community of eco-conscious shoppers making a difference.
                        </p>
                        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4D35E] text-[#2D5F3F] rounded-full font-bold hover:bg-white transition-all shadow-lg">
                            Browse Products <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            
            <section className="py-20 bg-[#F5F0E6]">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-6">Understanding Eco Tokens</h2>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Eco Tokens are CircuCity's way of rewarding you for making sustainable choices. Every time you purchase a product from our marketplace, you automatically earn tokens based on the environmental impact of your purchase — specifically, the CO₂ saved compared to buying a new, conventionally manufactured equivalent.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        For example, buying a second-hand cotton tote bag instead of a new plastic one earns you tokens reflecting the water saved, the plastic avoided, and the carbon footprint reduction from not manufacturing a new product from raw materials.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-6">
                        Tokens are calculated automatically and appear in your account within minutes of purchase. You can check your balance anytime on the leaderboard page, where you also see how you rank among other eco-conscious shoppers in the CircuCity community.
                    </p>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Redeeming Your Tokens</h3>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Once you have accumulated enough tokens, you can redeem them for a variety of rewards. Each token is worth a small discount, and the more you redeem at once, the bigger the savings. Available rewards include percentage discounts on your next order, free shipping on eligible items, and exclusive access to limited-edition sustainable products.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        To redeem, simply browse our product catalog and look for items marked with the token discount badge. At checkout, you can apply your token balance to reduce the total price. You can also combine token discounts with seasonal promotions for even greater savings.
                    </p>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Tracking Your Impact</h3>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                        Beyond the rewards, Eco Tokens represent real environmental impact. Every token you earn corresponds to measurable CO₂ savings, water conservation, and waste reduction. Our community dashboard shows the collective impact of all CircuCity shoppers — together, we have saved thousands of kilograms of CO₂ and diverted tons of waste from landfills.
                    </p>
                    <p className="text-neutral-700 leading-relaxed">
                        Ready to start earning? Browse our catalog of sustainable products and make your first eco-friendly purchase today. Every purchase counts, and every token brings you closer to rewards while making a real difference for the planet.
                    </p>
                </div>
            </section>
</section>
        </div>
    );
}
