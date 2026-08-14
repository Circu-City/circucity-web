import Link from 'next/link';
import { Leaf } from 'lucide-react';

const linkClass = "text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors";

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Leaf className="w-10 h-10" />
                        <h1 className="text-4xl font-bold font-serif"> About Us</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
                <div className="bg-white rounded-xl shadow-sm p-8 sm:p-10">
                    {/* Introduction */}
                    <section className="pb-6">                        
                        <p className="text-gray-700 leading-relaxed">
                            <strong>Välkommen till CircuCity!</strong> Here in Sweden, we're building a simple, safe, and joyful way to give fashion, accessories, electronics, and kitchen essentials a second life — one second-hand item at a time.
                        </p>
                    </section>

                    {/* Our Mission */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Make second-hand the natural choice for everyone in Sweden (and soon beyond). We want CircuCity to be the place where:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>You easily find unique, high-quality pre-loved pieces at fair prices</li>
                            <li>You clear out your wardrobe responsibly instead of letting good items go to waste</li>
                            <li>You feel proud knowing every buy, sell, or future swap helps reduce overproduction, waste, and emissions</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            By choosing second-hand first, we all help build a stronger circular economy right here at home.
                        </p>
                    </section>

                    {/* Why CircuCity? */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Why CircuCity?</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Swedish roots</strong> — We're a proudly Swedish company based in Skellefteå, designed with Nordic values in mind: trust, transparency, simplicity, and care for the environment.</li>
                            <li><strong>Peer-to-peer from the start</strong> — Real people selling to real people. No middleman stockpiles — just your wardrobe connecting directly to someone else's.</li>
                            <li><strong>Built-in sustainability</strong> — Every transaction shows you the CO₂, water, and waste you've helped save. Earn Eco-Points for circular actions and see your personal impact grow.</li>
                            <li><strong>Safe & fair</strong> — Secure payments held until delivery, integrated tracked shipping (mostly PostNord), Shield Protection for real problems, honest condition rules, and a zero-tolerance approach to fakes or fraud.</li>
                            <li><strong>Community first</strong> — Polite communication, helpful reviews, and a shared goal: keep good things circulating instead of piling up in landfills.</li>
                        </ul>
                    </section>

                    {/* What Makes Us Different? */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">What Makes Us Different?</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Focus on honesty</strong> — Clear condition levels, mandatory disclosure of flaws, real user photos only.</li>
                            <li><strong>Eco-rewards</strong> — Eco-Points, leaderboards, and future perks for those who actively reuse and recycle.</li>
                            <li><strong>Local & thoughtful</strong> — Emphasis on sustainable packaging tips, free eco-mailer bags via partners, and collaboration with Swedish reuse initiatives.</li>
                            <li><strong>Coming soon</strong> — Direct swaps and multi-party swap cycles to make trading even more fun and emission-free.</li>
                        </ul>
                    </section>

                    {/* Our Promise to You */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Our Promise to You</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Whether you're decluttering, treasure-hunting for unique finds, or simply wanting to shop more consciously — CircuCity is here for you. We promise to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Keep the platform safe, fair, and easy to use</li>
                            <li>Protect your data responsibly (full GDPR compliance)</li>
                            <li>Continuously improve based on your feedback</li>
                            <li>Never compromise on sustainability or trust</li>
                        </ul>
                    </section>

                    {/* Join the CircuCity Community */}
                    <section className="pt-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Join the CircuCity Community</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Thousands of Swedes are already choosing second-hand first. By being here, you're part of a movement that's:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Reducing fashion's environmental footprint</li>
                            <li>Saving money (and the planet)</li>
                            <li>Rediscovering joy in preloved style</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Tack för att du är med och gör skillnad — en annorlunda tröja i taget. Let's keep the circle going!
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3"><strong>Questions or ideas?</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Browse the Help Centre</li>
                            <li>Contact us at <a href="mailto:circucity2024@gmail.com" className={linkClass}>circucity2024@gmail.com</a> or <a href="mailto:hr@circucity.com" className={linkClass}>hr@circucity.com</a></li>
                            <li>Report anything suspicious directly in the app</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We're excited to have you here. Happy trading — and happy reusing! ♻️
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This content may be updated as we grow, launch new features (swaps, professional sellers, more countries), or refine our impact story. Major changes will be shared via email or in-app notifications.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}