'use client';

import Link from 'next/link';
import { LifeBuoy, MessageSquare, Mail, ArrowRight } from 'lucide-react';

export default function SellerSupportPage() {
    const openChat = () => {
        const btn = document.querySelector('[data-rag-chat-trigger]') as HTMLButtonElement;
        if (btn) btn.click();
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Support</h1>
                <p className="text-sm text-gray-500">Get help with your seller account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-[#E7F0E9] rounded-xl w-fit mb-4">
                        <LifeBuoy className="w-6 h-6 text-[#2D5F3F]" />
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 mb-2">Help Center</h3>
                    <p className="text-sm text-gray-500 mb-4">Browse our guides and FAQs for sellers.</p>
                    <Link href="/help-center" className="text-[#2D5F3F] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        View Guides <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-[#FDF8E4] rounded-xl w-fit mb-4">
                        <MessageSquare className="w-6 h-6 text-[#D4A373]" />
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-gray-500 mb-4">Chat with our support team in real-time.</p>
                    <button onClick={openChat} className="text-[#2D5F3F] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Start Chat <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-[#E8F8F5] rounded-xl w-fit mb-4">
                        <Mail className="w-6 h-6 text-[#1ABC9C]" />
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 mb-2">Email Us</h3>
                    <p className="text-sm text-gray-500 mb-4">Send us a message and we&apos;ll respond within 24 hours.</p>
                    <a href="mailto:orders@circucity.com" className="text-[#2D5F3F] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Send Email <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
