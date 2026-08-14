'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { PayoutStatus } from '@prisma/client';

export async function createPayout(shopId: string, amount: number) {
  try {
    await prisma.payout.create({
      data: { shopId, amount, status: 'PENDING' },
    });
    revalidatePath('/dashboard/admin/payouts');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updatePayoutStatus(payoutId: string, status: PayoutStatus) {
  try {
    const data: any = { status };
    if (status === 'PAID' || status === 'FAILED') {
      data.processedAt = new Date();
    }
    await prisma.payout.update({ where: { id: payoutId }, data });
    revalidatePath('/dashboard/admin/payouts');
    revalidatePath('/dashboard/seller/settings');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function processSellerPayouts(shopId: string) {
  try {
    // Calculate pending earnings from delivered orders for this shop
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        products: {
          include: {
            orderItems: {
              where: { order: { status: 'DELIVERED' } },
              include: { order: true },
            },
          },
        },
      },
    });

    if (!shop) return { success: false, error: 'Shop not found' };

    // Sum up all delivered order items for this shop
    let totalEarnings = 0;
    for (const product of shop.products) {
      for (const oi of product.orderItems) {
        totalEarnings += Number(oi.price) * oi.quantity;
      }
    }

    // Subtract any existing payouts
    const existingPayouts = await prisma.payout.aggregate({
      where: { shopId, status: { in: ['PAID', 'PROCESSING'] } },
      _sum: { amount: true },
    });
    const alreadyPaid = Number(existingPayouts._sum.amount || 0);
    const pendingAmount = totalEarnings - alreadyPaid;

    if (pendingAmount <= 0) {
      return { success: false, error: 'No pending earnings to payout' };
    }

    const payout = await prisma.payout.create({
      data: { shopId, amount: pendingAmount, status: 'PENDING' },
    });

    revalidatePath('/dashboard/admin/payouts');
    return { success: true, payoutId: payout.id, amount: pendingAmount };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
