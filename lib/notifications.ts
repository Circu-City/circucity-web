import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export async function sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'INFO',
    link?: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

export async function getNotifications(userId: string, limit = 10) {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

export async function getUnreadCount(userId: string) {
    try {
        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}
