import prisma from '@/lib/prisma';

export async function getUserWishlistProductIds(userId: string | null): Promise<string[]> {
    if (!userId) return [];

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: { items: { select: { productId: true } } }
    });

    return wishlist?.items.map(item => item.productId) || [];
}
