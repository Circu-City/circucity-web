'use server';

import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, role: Role) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        revalidatePath('/dashboard/admin/users');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath('/dashboard/admin/users');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string }) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data,
        });
        revalidatePath('/dashboard/admin/users');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return { success: false, error: 'Failed to update user profile' };
    }
}
