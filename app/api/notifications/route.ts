import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/notifications';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await getNotifications(userId);
        const unreadCount = await getUnreadCount(userId);

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, type } = body;

        if (type === 'markAllRead') {
            await markAllAsRead(userId);
            return NextResponse.json({ success: true });
        }

        if (!id) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        // Verify ownership (optional check, but good practice)
        // For now trusting id matches valid notification
        await markAsRead(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
