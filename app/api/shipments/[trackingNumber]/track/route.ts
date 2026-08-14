import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getPostNordClient } from '@/lib/postnord';

/**
 * GET /api/shipments/[trackingNumber]/track
 * Get tracking information and update database
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ trackingNumber: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trackingNumber } = await params;

        // Find shipment in database
        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            include: {
                order: {
                    select: { userId: true },
                },
                trackingEvents: {
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!shipment) {
            return NextResponse.json(
                { error: 'Shipment not found' },
                { status: 404 }
            );
        }

        // Verify user has permission to view this shipment
        if (shipment.order.userId !== userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });

            if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Fetch latest tracking information from PostNord
        const postnordClient = getPostNordClient();
        const trackingInfo = await postnordClient.trackShipment(trackingNumber);

        // Map PostNord status to our ShipmentStatus enum
        const statusMapping: Record<string, any> = {
            'In transit': 'IN_TRANSIT',
            'Out for delivery': 'OUT_FOR_DELIVERY',
            Delivered: 'DELIVERED',
            'Picked up': 'PICKED_UP',
            'Delivery failed': 'FAILED_DELIVERY',
            Returned: 'RETURNED',
        };

        const mappedStatus =
            statusMapping[trackingInfo.status] || shipment.status;

        // Update shipment status
        const updatedShipment = await prisma.shipment.update({
            where: { trackingNumber },
            data: {
                status: mappedStatus,
                estimatedDelivery: trackingInfo.estimatedDelivery
                    ? new Date(trackingInfo.estimatedDelivery)
                    : shipment.estimatedDelivery,
                actualDelivery: trackingInfo.actualDelivery
                    ? new Date(trackingInfo.actualDelivery)
                    : shipment.actualDelivery,
            },
        });

        // Add new tracking events
        for (const event of trackingInfo.events) {
            // Check if event already exists
            const existingEvent = await prisma.trackingEvent.findFirst({
                where: {
                    shipmentId: shipment.id,
                    timestamp: new Date(event.timestamp),
                    status: event.status,
                },
            });

            if (!existingEvent) {
                await prisma.trackingEvent.create({
                    data: {
                        shipmentId: shipment.id,
                        status: event.status,
                        description: event.description,
                        location: event.location || event.city,
                        timestamp: new Date(event.timestamp),
                    },
                });
            }
        }

        // Update order status if delivered
        if (mappedStatus === 'DELIVERED') {
            await prisma.order.update({
                where: { id: shipment.orderId },
                data: { status: 'DELIVERED' },
            });
        }

        // Fetch updated tracking events
        const updatedEvents = await prisma.trackingEvent.findMany({
            where: { shipmentId: shipment.id },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json({
            shipment: {
                ...updatedShipment,
                trackingEvents: updatedEvents,
            },
            trackingInfo,
        });
    } catch (error) {
        console.error('Error tracking shipment:', error);
        return NextResponse.json(
            {
                error: 'Failed to track shipment',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
