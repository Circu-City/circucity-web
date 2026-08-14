'use client';

import { useState } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function ChatTrigger() {
    const [chatOpen, setChatOpen] = useState(false);

    const openChat = () => {
        const btn = document.querySelector('[data-rag-chat-trigger]') as HTMLButtonElement;
        if (btn) btn.click();
        setChatOpen(true);
    };

    return (
        <button onClick={openChat} className="inline-flex items-center gap-1 text-[#2D5F3F] font-medium text-sm hover:gap-2 transition-all">
            {chatOpen ? 'Chat is open' : 'Start Chat'} <ArrowRight className="w-4 h-4" />
        </button>
    );
}
