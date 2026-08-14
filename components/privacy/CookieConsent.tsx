"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2D5F3F] text-white p-4 z-50 shadow-lg animate-in slide-in-from-bottom">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-[#F4D35E] mb-1">We value your privacy</h3>
                    <p className="text-xs text-gray-300">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleDecline} className="text-white border-white/20 hover:bg-white/10 hover:text-white bg-transparent">
                        Decline
                    </Button>
                    <Button size="sm" onClick={handleAccept} className="bg-[#F4D35E] text-[#2D5F3F] hover:bg-[#e6c235]">
                        Accept All
                    </Button>
                    <button onClick={() => setShow(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
