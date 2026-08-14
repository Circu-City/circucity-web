'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    RefreshCw,
    BarChart3,
    Store,
    LifeBuoy,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Overview', href: '/dashboard/seller', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/seller/products', icon: Package },
    { name: 'Orders', href: '/dashboard/seller/orders', icon: ShoppingBag },
    { name: 'Swap Market', href: '/dashboard/seller/swap', icon: RefreshCw },
    { name: 'Analytics', href: '/dashboard/seller/analytics', icon: BarChart3 },
    { name: 'My Store', href: '/dashboard/seller/settings', icon: Store },
    { name: 'Support', href: '/dashboard/seller/support', icon: LifeBuoy },
];

export function SidebarContent() {
    const pathname = usePathname();
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-5 flex items-center gap-3 border-b border-gray-50 flex-shrink-0">
                <div className="bg-[#2D5F3F] h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-[#2D5F3F]/20">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                    <span className="text-[#2D5F3F] font-bold text-base tracking-tight block leading-tight">Seller Hub</span>
                    <span className="text-gray-400 text-[11px] block leading-tight">Manage your store</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-4">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const isRoot = item.href === '/dashboard/seller';
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
                                    ? "bg-[#2D5F3F]/10 text-[#2D5F3F]"
                                    : "text-gray-500 hover:bg-green-50/70 hover:text-[#2D5F3F]"
                            )}
                        >
                            {activeState && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2D5F3F] rounded-r-full" />
                            )}
                            <Icon className={cn("h-[18px] w-[18px] transition-colors", activeState ? "text-[#2D5F3F]" : "text-gray-400 group-hover:text-[#2D5F3F]")} strokeWidth={1.5} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-gray-50 flex-shrink-0 bg-gray-50/30">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-xl transition-all text-sm font-medium"
                >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    <span>Back to Marketplace</span>
                </Link>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-gray-100 flex-col h-screen fixed left-0 top-0 z-40 shadow-sm hidden md:flex bg-white">
            <SidebarContent />
        </aside>
    );
}
