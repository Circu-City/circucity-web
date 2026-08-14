'use client';

import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notification";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "@/components/seller/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    link?: string | null;
}

export function TopBar() {
    const { user } = useUser();
    const pathname = usePathname();

    // Determine title based on path
    const getTitle = () => {
        if (pathname === '/dashboard/seller') return 'Overview';
        if (pathname.includes('/products')) return 'Products';
        if (pathname.includes('/orders')) return 'Orders';
        if (pathname.includes('/settings')) return 'Settings';
        return 'Dashboard';
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 py-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <h1 className="text-xl md:text-2xl font-bold text-[#2D5F3F]">{getTitle()}</h1>
            </div>

            <div className="flex items-center gap-4">
                <NotificationDropdown />

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-[#2D5F3F]">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">Seller</p>
                    </div>
                    <UserButton />
                </div>
            </div>
        </header>
    );
}

function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        // Don't show loading on subsequent polls, only initial
        if (notifications.length === 0) setLoading(true);
        const res = await getNotifications();
        if (res.success && res.notifications) {
            setNotifications(res.notifications);
        }
        setLoading(false);
    }, [notifications.length]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
        // Poll every minute for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await markAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } else {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsRead();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } else {
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        }

        if (notification.link) {
            router.push(notification.link);
            setOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-gray-400 hover:text-[#2D5F3F] transition-colors rounded-full hover:bg-gray-50 outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:ring-offset-1">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-white"></span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white p-0 shadow-xl border border-gray-100 rounded-lg overflow-hidden z-50">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 border-b border-gray-100">
                    <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-6 text-[#2D5F3F] hover:text-[#162d24] px-2 hover:bg-gray-100"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="flex justify-center py-8 text-gray-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-50 transition-colors group relative ${!notification.isRead ? 'bg-green-50/30' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Action buttons - Absolute positioned for cleaner layout */}
                                    <div className="absolute right-2 top-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1">
                                        {!notification.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                className="text-gray-400 hover:text-green-600 p-1 rounded-md hover:bg-green-50 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {notification.link && (
                                            <span className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors block">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
