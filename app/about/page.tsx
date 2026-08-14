import Link from "next/link";
import { Leaf, RefreshCcw, ShieldCheck, HeartHandshake, ArrowRight, Users } from "lucide-react";

const team = [
  { name: "Dennis Mafunga", role: "Tech Lead / Platform", focus: "AI", emoji: "🤖" },
  { name: "Alome Emmanuel", role: "Head of Product and Development", focus: "", emoji: "🛠️" },
  { name: "Shakira Ssebunya", role: "Co-Founder / Growth", focus: "Community", emoji: "🌱" },
  { name: "Shangwe Nasser", role: "Co-Founder / COO / Operations", focus: "Execution", emoji: "⚡" },
  { name: "Akintunde Akinmusuyi", role: "Co-Founder / Finance", focus: "Strategy · Sustainability", emoji: "📊" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#fcf9f2]">
            {/* Hero Section */}
            <section className="bg-[#2D5F3F] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F4D35E] blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                        Welcome to <span className="text-[#F4D35E]">CircuCity</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-200">
                        Sweden's innovative circular marketplace where second-hand items find new homes, value keeps circulating, and every transaction helps build a more sustainable future.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                {/* Introduction */}
                <section className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed">
                    <p>
                        At <strong>CircuCity AB</strong>, we believe that value doesn't disappear—it just moves. Founded in Skellefteå, Sweden, we created a simple, safe, and rewarding platform to buy, sell, and (coming soon) swap pre-loved items. Our mission is to make reuse effortless while reducing waste, lowering CO₂ emissions, and supporting the circular economy.
                    </p>
                </section>

                {/* Our Story */}
                <section>
                    <h2 className="text-3xl font-bold text-[#2D5F3F] mb-6 flex items-center">
                        <HeartHandshake className="w-8 h-8 mr-3 text-[#F4D35E]" />
                        Our Story
                    </h2>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed space-y-4">
                        <p>
                            CircuCity was born from a passion for sustainability and a frustration with the throwaway culture. Launched as a modern online platform, we combine user-friendly technology with a strong focus on community, trust, and environmental impact.
                        </p>
                        <p>
                            Headquartered in Skellefteå at Gruvgatan 17, our small but dedicated team is driven by one core idea: extending the life of products through smart, local, and digital solutions. We started with buying and selling second-hand goods securely—and we're expanding into multi-party swaps and advanced features to make circular living even more accessible across Sweden (and beyond in the future).
                        </p>
                    </div>
                </section>

                {/* What We Do */}
                <section>
                    <h2 className="text-3xl font-bold text-[#2D5F3F] mb-8">What We Do</h2>
                    <p className="text-xl text-gray-600 mb-8">CircuCity is more than a marketplace—it's a movement toward a circular lifestyle:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-[#2D5F3F]/10 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-[#2D5F3F]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2D5F3F] mb-3">Buy & Sell with Confidence</h3>
                            <p className="text-gray-600">Browse curated second-hand items or list your own with photos, descriptions, and condition details. Secure payments, integrated shipping (via trusted partners like PostNord, Bring, and Budbee), and Buyer Protection keep everything safe and transparent.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F4D35E]/30 relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-[#F4D35E] text-[#2D5F3F] text-xs font-bold px-3 py-1 rounded-full">Coming Soon</div>
                            <div className="w-12 h-12 bg-[#F4D35E]/20 rounded-xl flex items-center justify-center mb-4">
                                <RefreshCcw className="w-6 h-6 text-[#2D5F3F]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2D5F3F] mb-3">Swapping Made Simple</h3>
                            <p className="text-gray-600">Direct swaps or even multi-party swap cycles let you exchange items without money changing hands, keeping goods in use longer.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Leaf className="w-6 h-6 text-green-700" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2D5F3F] mb-3">Earn Rewards for Doing Good</h3>
                            <p className="text-gray-600">Gain eco-points for every sustainable action (buying, selling, or swapping second-hand). Track your personal CO₂ savings, climb leaderboards, and unlock future perks.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <HeartHandshake className="w-6 h-6 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2D5F3F] mb-3">Community & Impact</h3>
                            <p className="text-gray-600">We partner with local second-hand stores, sustainability initiatives, and logistics providers to keep value circulating locally and minimize environmental harm.</p>
                        </div>
                    </div>
                    <p className="mt-8 text-center text-lg font-medium text-[#2D5F3F] bg-[#F4D35E]/20 p-6 rounded-xl">
                        Every item you list, buy, or swap helps reduce waste, conserve resources, and fight climate change—one transaction at a time.
                    </p>
                </section>

                {/* Our Values */}
                <section className="bg-[#2D5F3F] text-white rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#F4D35E]">Our Values</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1"><Leaf className="w-6 h-6 text-[#F4D35E]" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Sustainability First</h3>
                                <p className="text-gray-300">We prioritize reuse to extend product lifecycles and cut emissions.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1"><ShieldCheck className="w-6 h-6 text-[#F4D35E]" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Transparency & Security</h3>
                                <p className="text-gray-300">All transactions stay on-platform with secure payments, tracking, and protections.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1"><HeartHandshake className="w-6 h-6 text-[#F4D35E]" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Community-Driven</h3>
                                <p className="text-gray-300">We build trust through ratings, support, and shared commitment to the circular economy.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1"><RefreshCcw className="w-6 h-6 text-[#F4D35E]" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Innovation</h3>
                                <p className="text-gray-300">User-friendly features, upcoming AI tools, and eco-impact tracking make circular living rewarding and fun.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Team */}
                <section>
                    <h2 className="text-3xl font-bold text-[#2D5F3F] mb-8 flex items-center">
                        <Users className="w-8 h-8 mr-3 text-[#F4D35E]" />
                        Our Team
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-2xl">
                        The people behind CircuCity—working every day to make circular living accessible, rewarding, and impactful.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.map((member) => (
                            <div key={member.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#2D5F3F]/20 transition-all">
                                <div className="w-14 h-14 rounded-full bg-[#2D5F3F]/10 flex items-center justify-center text-2xl mb-4">
                                    {member.emoji}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                                <p className="text-sm text-[#2D5F3F] font-medium mt-1">{member.role}</p>
                                {member.focus && (
                                    <span className="inline-block mt-2 text-xs bg-[#F4D35E]/20 text-[#2D5F3F] px-3 py-1 rounded-full font-medium">
                                        {member.focus}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Looking Ahead & CTA */}
                <section className="text-center space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#2D5F3F] mb-4">Looking Ahead</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            We're just getting started. As we grow, we'll roll out swap features, multi-party matching, enhanced listing optimization, more rewards, and potential expansion across the Nordics and EU.
                        </p>
                    </div>

                    <p className="text-2xl font-bold text-[#2D5F3F] italic">
                        Together, we're creating a better way to shop second-hand in Sweden—one that's good for people, good for the planet, and good for your wallet.
                    </p>

                    <div className="pt-8 flex flex-col items-center justify-center gap-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-[#2D5F3F]">Join the CircuCity community today.</h3>
                        <p className="text-gray-600">Sign up for free, start browsing, list your first item, and become part of the reuse revolution.</p>

                        <div className="flex gap-4 mt-2">
                            <Link href="/become-seller">
                                <button className="bg-[#2D5F3F] hover:bg-[#2a5242] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Become a Member <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                            </Link>
                        </div>

                        <div className="flex gap-4 text-sm font-bold text-[#2D5F3F]/60 mt-4 flex-wrap justify-center">
                            <span>#CircuCity</span>
                            <span>#CircularLiving</span>
                            <span>#SecondHandSweden</span>
                            <span>#Hållbarhet</span>
                            <span>#ReuseRevolution</span>
                        </div>
                    </div>
                </section>

                {/* Footer Callout */}
                <section className="bg-gray-100 p-8 rounded-2xl text-center text-gray-600 text-sm mt-16">
                    <h4 className="font-bold text-[#2D5F3F] text-lg mb-2">CircuCity AB</h4>
                    <p>Gruvgatan 17C, 931 48 Skellefteå, Sweden</p>
                    <p className="mt-2">
                        Email: <a href="mailto:circucity2024@gmail.com" className="font-medium text-[#2D5F3F] hover:underline">circucity2024@gmail.com</a> | <a href="mailto:hr@circucity.com" className="font-medium text-[#2D5F3F] hover:underline">hr@circucity.com</a>
                    </p>
                    <p className="mt-4 pt-4 border-t border-gray-200">
                        Questions? Visit our Help Centre or contact support directly from your account.
                    </p>
                </section>
            </div>
        </div>
    );
}
