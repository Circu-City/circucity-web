import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getPostNordClient } from '@/lib/postnord';
import { getShipmondoShipment } from '@/lib/shipmondo';

/**
 * GET /api/shipments/[trackingNumber]/label
 * Fetch the shipping label from the appropriate carrier (PostNord or Shipmondo)
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ trackingNumber: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const { trackingNumber } = params;

        // Verify the user has access.
        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            include: { order: true },
        });

        if (!shipment) {
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        const userRole = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (
            shipment.order.userId !== userId &&
            userRole?.role !== 'SELLER' &&
            userRole?.role !== 'ADMIN'
        ) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // ── Shipmondo label ──────────────────────────────────────────
        if (shipment.shipmondoShipmentId || shipment.carrier === 'Shipmondo') {
            if (shipment.labelUrl) {
                return NextResponse.redirect(new URL(shipment.labelUrl));
            }
            const shipmondoData = await getShipmondoShipment(shipment.shipmondoShipmentId!);
            const labelUrl = shipmondoData?.label?.url || shipmondoData?.labels?.[0]?.url;
            if (labelUrl) {
                return NextResponse.redirect(new URL(labelUrl));
            }
            const labelBase64 = shipmondoData?.label?.base64 || shipmondoData?.labels?.[0]?.base64;
            if (labelBase64) {
                const base64Data = labelBase64.split(',')[1] || labelBase64;
                const pdfBuffer = Buffer.from(base64Data, 'base64');
                return new NextResponse(pdfBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="shipping-label-${trackingNumber}.pdf"`,
                    },
                });
            }
            return NextResponse.json(
                { error: 'No label available for this Shipmondo shipment' },
                { status: 400 }
            );
        }

        // ── PostNord label ──────────────────────────────────────────
        if (!shipment.postnordShipmentId) {
            if (shipment.labelUrl && shipment.labelUrl.startsWith('data:')) {
                const base64Data = shipment.labelUrl.split(',')[1];
                if (base64Data) {
                    const pdfBuffer = Buffer.from(base64Data, 'base64');
                    return new NextResponse(pdfBuffer, {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': `attachment; filename="shipping-label-${trackingNumber}.pdf"`,
                        },
                    });
                }
            }
            return NextResponse.json(
                { error: 'No PostNord shipment ID available for this shipment' },
                { status: 400 }
            );
        }

        const postnordClient = getPostNordClient();
        const result = await postnordClient.getShippingLabel(shipment.postnordShipmentId);
        
        if (result.labelUrl) {
            return NextResponse.redirect(new URL(result.labelUrl));
        }

        const base64Data = result.labelBase64?.split(',')[1];
        
        if (!base64Data) {
            throw new Error('No label data received from PostNord');
        }

        const pdfBuffer = Buffer.from(base64Data, 'base64');
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="shipping-label-${trackingNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error fetching label:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve shipping label', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
