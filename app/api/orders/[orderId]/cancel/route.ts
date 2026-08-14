import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * Cancel an order and process refund
 * POST /api/orders/[orderId]/cancel
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Await params in Next.js 15
        const { orderId } = await params;
        const body = await req.json();
        const { reason } = body;

        console.log(`=== CANCELLING ORDER ${orderId} ===`);
        console.log('Requested by user:', userId);
        console.log('Reason:', reason);

        // Fetch the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }

        // Verify user owns this order (or is admin)
        if (order.userId !== userId) {
            // TODO: Add admin check here
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Check if order can be cancelled
        if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
            return new NextResponse('Order already cancelled', { status: 400 });
        }

        if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
            return new NextResponse('Cannot cancel shipped/delivered orders', { status: 400 });
        }

        // Process refund via Stripe if order was paid
        let refundId: string | null = null;
        if (order.status === 'PAID' && order.stripeChargeId) {
            console.log('Processing Stripe refund for charge:', order.stripeChargeId);

            try {
                const refund = await stripe.refunds.create({
                    charge: order.stripeChargeId,
                    reason: 'requested_by_customer',
                    metadata: {
                        orderId: order.id,
                        userId: userId,
                        cancellationReason: reason || 'Customer requested cancellation'
                    }
                });

                refundId = refund.id;
                console.log('✅ Refund created:', refundId);
            } catch (error: any) {
                console.error('❌ Stripe refund failed:', error.message);
                return new NextResponse(
                    JSON.stringify({ error: 'Refund processing failed', details: error.message }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Update order status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: reason || 'Customer requested cancellation',
                refundId: refundId
            }
        });

        console.log('✅ Order status updated to CANCELLED');

        // Restore inventory
        console.log('\n=== RESTORING INVENTORY ===');
        for (const item of order.items) {
            console.log(`Restoring ${item.quantity} units of product ${item.productId}`);

            try {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        inventory: {
                            increment: item.quantity
                        }
                    }
                });

                // Check if product was out of stock
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { id: true, inventory: true, status: true }
                });

                if (product && product.status === 'OUT_OF_STOCK' && product.inventory > 0) {
                    console.log(`Setting product ${item.productId} back to ACTIVE`);
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { status: 'ACTIVE' }
                    });
                }
            } catch (error: any) {
                console.error(`❌ Error restoring inventory for product ${item.productId}:`, error.message);
            }
        }

        console.log('✅ Inventory restored successfully');
        console.log('=== ORDER CANCELLATION COMPLETE ===\n');

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            refundId: refundId,
            message: 'Order cancelled successfully'
        });

    } catch (error: any) {
        console.error('❌ Error cancelling order:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to cancel order', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
