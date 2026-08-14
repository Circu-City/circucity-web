"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'SE';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    EN: {
        "free_shipping": "⚡ Free shipping on eco-friendly orders over 2000 kr",
        "swap_market": "Swap Market",
        "eco_tokens": "Eco Tokens",
        "track_impact": "Track Impact",
        "become_seller": "Become a Seller",
        "leaderboard": "Leaderboard"
    },
    SE: {
        "free_shipping": "⚡ Fri frakt på miljövänliga beställningar över 2000 kr",
        "swap_market": "Bytesmarknad",
        "eco_tokens": "Eko-poäng",
        "track_impact": "Spåra Inverkan",
        "become_seller": "Bli Säljare",
        "leaderboard": "Topplista"
    }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('EN');

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
