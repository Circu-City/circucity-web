'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const { userId } = await auth();
    console.log("Toggle Wishlist User ID:", userId);

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // 1. Get or Create user's wishlist
        let wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: { items: true }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId },
                include: { items: true }
            });
        }

        // 2. Check if product is already in wishlist
        const existingItem = wishlist.items.find(item => item.productId === productId);

        if (existingItem) {
            // Remove
            await prisma.wishlistItem.delete({
                where: { id: existingItem.id }
            });
            revalidatePath('/');
            revalidatePath('/wishlist');
            revalidatePath('/products');
            return { success: true, isWishlisted: false };
        } else {
            // Add
            await prisma.wishlistItem.create({
                data: {
                    wishlistId: wishlist.id,
                    productId
                }
            });
            revalidatePath('/');
            revalidatePath('/wishlist');
            revalidatePath('/products');
            return { success: true, isWishlisted: true };
        }

    } catch (error) {
        console.error('Failed to toggle wishlist:', error);
        return { success: false, error: 'Failed to update wishlist' };
    }
}
