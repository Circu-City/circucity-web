'use server';

import prisma from '@/lib/prisma';
import { ShopStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateShopStatus(shopId: string, status: ShopStatus) {
    try {
        await prisma.shop.update({
            where: { id: shopId },
            data: { status },
        });
        revalidatePath('/dashboard/admin/sellers');
        return { success: true };
    } catch (error) {
        console.error('Failed to update shop status:', error);
        return { success: false, error: 'Failed to update shop status' };
    }
}
