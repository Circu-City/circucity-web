
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Bell, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { markAllAsRead } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

async function markAllRead() {
    'use server';
    const { userId } = await auth();
    if (userId) {
        await markAllAsRead(userId);
        revalidatePath('/notifications');
    }
}

export default async function NotificationsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 for now
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        You have {unreadCount} unread notifications
                    </p>
                </div>
                {unreadCount > 0 && (
                    <form action={markAllRead}>
                        <Button variant="outline" size="sm">
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    </form>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`
                                relative flex gap-4 p-4 rounded-xl border transition-all
                                ${!notification.isRead
                                    ? 'bg-blue-50/50 border-blue-100 hover:border-blue-200'
                                    : 'bg-white border-gray-100 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className={`
                                mt-1 h-2 w-2 rounded-full flex-shrink-0
                                ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}
                            `} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                    <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                    {notification.message}
                                </p>

                                {notification.link && (
                                    <Link
                                        href={notification.link}
                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        View Details →
                                    </Link>
                                )}
                            </div>

                            <Badge variant="secondary" className="absolute top-4 right-4 text-[10px] uppercase tracking-wider h-5">
                                {notification.type}
                            </Badge>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
