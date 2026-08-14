'use client';

import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export function AdminTopBar() {
    const pathname = usePathname();

    // Determine title based on path
    const getTitle = () => {
        if (pathname === '/dashboard/admin') return 'Overview';
        if (pathname.includes('/orders')) return 'Order Management';
        if (pathname.includes('/sellers')) return 'Seller Management';
        if (pathname.includes('/products')) return 'Listing Moderation';
        if (pathname.includes('/refunds')) return 'Refunds & Disputes';
        if (pathname.includes('/payouts')) return 'Financials & Payouts';
        if (pathname.includes('/tickets')) return 'Support Tickets';
        if (pathname.includes('/audit-logs')) return 'System Audit Logs';
        if (pathname.includes('/settings')) return 'Admin Settings';
        return 'Admin Dashboard';
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-8 py-4 mb-8 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <UserButton />
                </div>
            </div>
        </header>
    );
}
