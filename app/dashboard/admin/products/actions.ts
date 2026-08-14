'use server';

import prisma from '@/lib/prisma';
import { ProductModerationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateProductModerationStatus(productId: string, status: ProductModerationStatus) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { moderationStatus: status },
        });
        revalidatePath('/dashboard/admin/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product moderation status:', error);
        return { success: false, error: 'Failed to update product status' };
    }
}

export async function updateProductFeaturedStatus(productId: string, isFeatured: boolean) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { isFeatured },
        });
        revalidatePath('/dashboard/admin/products');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product featured status:', error);
        return { success: false, error: 'Failed to update featured status' };
    }
}

export async function deleteProduct(productId: string) {
    try {
        // Delete related records first due to FK constraints
        await prisma.$transaction([
            prisma.productView.deleteMany({ where: { productId } }),
            prisma.review.deleteMany({ where: { productId } }),
            prisma.wishlistItem.deleteMany({ where: { productId } }),
            prisma.swapProposal.deleteMany({ where: { productId } }),
            prisma.orderItem.deleteMany({ where: { productId } }),
            prisma.product.delete({ where: { id: productId } }),
        ]);
        revalidatePath('/dashboard/admin/products');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete product:', error?.message || error);
        return { success: false, error: error?.message || 'Failed to delete product' };
    }
}
