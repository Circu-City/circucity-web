'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type NotificationState = {
    message: string;
    success?: boolean;
    notifications?: any[];
};

export async function getNotifications() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { message: "Unauthorized", success: false, notifications: [] };
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20, // Limit to 20 most recent
        });

        return { message: "Notifications fetched", success: true, notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { message: "Failed to fetch notifications", success: false, notifications: [] };
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { message: "Unauthorized", success: false };
        }

        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: userId, // Ensure ownership
            },
            data: {
                isRead: true,
            },
        });

        revalidatePath('/dashboard/seller'); // Revalidate the dashboard layout
        return { message: "Marked as read", success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { message: "Failed to update notification", success: false };
    }
}

export async function markAllAsRead() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { message: "Unauthorized", success: false };
        }

        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        revalidatePath('/dashboard/seller');
        return { message: "All marked as read", success: true };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return { message: "Failed to update notifications", success: false };
    }
}
