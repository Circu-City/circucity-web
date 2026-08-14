'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Undo2,
    Banknote,
    LifeBuoy,
    ShieldAlert,
    Settings,
    LogOut,
    MessageSquare,
    Bot,
    VoteIcon,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
    { name: 'Sellers', href: '/dashboard/admin/sellers', icon: Users },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Moderation', href: '/dashboard/admin/products', icon: Package },
    { name: 'Refunds', href: '/dashboard/admin/refunds', icon: Undo2 },
    { name: 'Payouts', href: '/dashboard/admin/payouts', icon: Banknote },
    { name: 'Support', href: '/dashboard/admin/tickets', icon: LifeBuoy },
    { name: 'Feedback', href: '/dashboard/admin/feedback', icon: MessageSquare },
    { name: 'Voting', href: '/dashboard/admin/voting', icon: VoteIcon },
    { name: 'Challenges', href: '/dashboard/admin/challenges', icon: Target },
    { name: 'Chatbot', href: '/dashboard/admin/chatbot', icon: Bot },
    { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: ShieldAlert },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export function AdminSidebarContent() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-[#0f172a]">
            <div className="p-5 flex items-center gap-3 border-b border-white/[0.06] flex-shrink-0">
                <div className="bg-[#2D5F3F] h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-[#2D5F3F]/30">
                    <span className="text-white font-bold text-lg">C</span>
                </div>
                <div>
                    <span className="text-white font-bold text-base tracking-tight block leading-tight">CircuCity</span>
                    <span className="text-gray-500 text-[11px] block leading-tight">Admin Console</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-4">
                    Navigation
                </div>
                {menuItems.map((item) => {
                    const isRoot = item.href === '/dashboard/admin';
                    const isActive = isRoot ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const activeState = isRoot ? pathname === item.href : isActive;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium relative",
                                activeState
                                    ? "bg-[#2D5F3F]/15 text-[#4ade80]"
                                    : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
                            )}
                        >
                            {activeState && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#4ade80] rounded-r-full" />
                            )}
                            <Icon className={cn("h-[18px] w-[18px] transition-colors", activeState ? "text-[#4ade80]" : "text-gray-500 group-hover:text-gray-300")} strokeWidth={1.5} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 rounded-xl transition-all text-sm font-medium"
                >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    <span>Exit Admin</span>
                </Link>
            </div>
        </div>
    );
}

export function AdminSidebar() {
    return (
        <aside className="w-64 border-r border-white/[0.04] flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex bg-[#0f172a]">
            <AdminSidebarContent />
        </aside>
    );
}
