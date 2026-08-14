'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function processRefund(orderId: string, type: 'FULL' | 'PARTIAL', amount?: number, reason?: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Logic to interface with Stripe would go here
        // await stripe.refunds.create({ ... })

        const status = type === 'FULL' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
        const refundAmount = type === 'FULL' ? order.total : amount;

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                refundAmount,
                cancellationReason: reason
            }
        });

        revalidatePath(`/dashboard/admin/orders/${orderId}`);
        revalidatePath('/dashboard/admin/orders');
        revalidatePath('/dashboard/admin/refunds');

        return { success: true };
    } catch (error) {
        console.error('Refund error:', error);
        return { success: false, error: 'Failed to process refund' };
    }
}
