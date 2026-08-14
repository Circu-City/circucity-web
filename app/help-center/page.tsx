import Link from 'next/link';
import { LifeBuoy, MessageSquare, Mail, ArrowRight, BookOpen, HelpCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Metadata } from 'next';
import { ChatTrigger } from './ChatTrigger';

export const metadata: Metadata = {
    title: 'Help Center | CircuCity',
    description: 'Get help with orders, shipping, returns, and account management at CircuCity.',
};

const faqs = [
    { q: 'How do I place an order?', a: 'Browse products, add to cart, and checkout securely with Stripe. You will receive an order confirmation via email.' },
    { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and American Express.' },
    { q: 'How does shipping work?', a: 'We partner with PostNord for reliable delivery. Shipping costs are calculated at checkout based on weight and destination.' },
    { q: 'Can I return an item?', a: 'Yes, returns are accepted within 14 days of delivery. Items must be in original condition. Visit our return policy page for details.' },
    { q: 'How do Eco Tokens work?', a: 'Earn Eco Tokens with every sustainable purchase. Accumulate tokens and redeem them for discounts on future orders.' },
    { q: 'How do I become a seller?', a: 'Click "Become a Seller" in the navigation bar or visit /become-seller to set up your shop and start listing products.' },
];

const guides = [
    { title: 'Getting Started', icon: BookOpen, desc: 'New to CircuCity? Learn how to create an account, browse products, and make your first purchase.', href: '/sign-up' },
    { title: 'Order Tracking', icon: Truck, desc: 'Track your shipments in real-time. Enter your tracking number to see where your package is.', href: '/dashboard/orders' },
    { title: 'Returns & Refunds', icon: RefreshCw, desc: 'Our hassle-free return policy explained. Learn about eligible items and the refund process.', href: '/return-policy' },
    { title: 'Shipping Info', icon: ShieldCheck, desc: 'Shipping rates, delivery times, and carrier information for domestic and international orders.', href: '/shipping-policy' },
];

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-[#F5F0E6]">
            <section className="bg-gradient-to-br from-[#2D5F3F] via-[#2D5F3F] to-[#2d5a45] text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                        <LifeBuoy className="w-4 h-4 text-[#F4D35E]" />
                        <span className="text-[#F4D35E] font-medium">Support Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
                    <p className="text-lg text-gray-300 max-w-xl mx-auto">
                        Find answers to common questions, browse guides, or chat with our support team.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                            <div className="p-3 bg-[#E7F0E9] rounded-xl w-fit mx-auto mb-4">
                                <BookOpen className="w-6 h-6 text-[#2D5F3F]" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Browse Guides</h3>
                            <p className="text-sm text-gray-500 mb-4">Step-by-step tutorials for buyers and sellers.</p>
                            <a href="#guides" className="inline-flex items-center gap-1 text-[#2D5F3F] font-medium text-sm hover:gap-2 transition-all">
                                View Guides <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                            <div className="p-3 bg-[#FDF8E4] rounded-xl w-fit mx-auto mb-4">
                                <MessageSquare className="w-6 h-6 text-[#D4A373]" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Live Chat</h3>
                            <p className="text-sm text-gray-500 mb-4">Chat with our AI support assistant in real-time for quick help.</p>
                            <ChatTrigger />
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                            <div className="p-3 bg-[#E8F8F5] rounded-xl w-fit mx-auto mb-4">
                                <Mail className="w-6 h-6 text-[#1ABC9C]" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Email Us</h3>
                            <p className="text-sm text-gray-500 mb-4">Send us a message and we will respond within 24 hours.</p>
                            <a href="mailto:orders@circucity.com" className="inline-flex items-center gap-1 text-[#2D5F3F] font-medium text-sm">
                                Send Email <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div id="guides" className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Popular Guides</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                            {guides.map((guide, i) => (
                                <Link key={i} href={guide.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#2D5F3F]/20 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-[#E7F0E9] rounded-lg shrink-0">
                                            <guide.icon className="w-5 h-5 text-[#2D5F3F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 group-hover:text-[#2D5F3F] transition-colors">{guide.title}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{guide.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {faqs.map((faq, i) => (
                                <details key={i} className="bg-white rounded-xl border border-gray-100 group">
                                    <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-neutral-900 list-none">
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-[#2D5F3F] shrink-0" />
                                            {faq.q}
                                        </span>
                                        <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                                    </summary>
                                    <p className="px-5 pb-5 pl-13 text-gray-600 leading-relaxed">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
