import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UTApi } from "uploadthing/server";
import prisma from '@/lib/prisma';
import { getPostNordClient } from '@/lib/postnord';
import { createShipmondoShipment, getShipmondoShipment } from '@/lib/shipmondo';
import { sendNotification } from '@/lib/notifications';
import { sendShipmentNotificationEmail } from '@/lib/email';

/**
 * POST /api/shipments
 * Create a new shipment for an order (PostNord or Shipmondo)
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            orderId,
            carrier = 'postnord',
            serviceCode = '19',
            weight,
            length,
            width,
            height,
            senderInfo,
            shipmondoTemplateId,
        } = body;

        // Verify the order exists and user has permission
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const userRole = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (userRole?.role !== 'SELLER' && userRole?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only sellers can create shipments' },
                { status: 403 }
            );
        }

        if (
            !order.shippingName ||
            !order.shippingAddressLine1 ||
            !order.shippingCity ||
            !order.shippingPostalCode ||
            !order.shippingCountry
        ) {
            return NextResponse.json(
                { error: 'Order missing shipping information' },
                { status: 400 }
            );
        }

        const shop = await prisma.shop.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        let shipmentResponse;
        let carrierName: string;

        if (carrier === 'shipmondo') {
            // Create Shipmondo shipment
            const shipmondoResult = await createShipmondoShipment({
                template_id: shipmondoTemplateId ? parseInt(shipmondoTemplateId) : undefined,
                sender: {
                    name: senderInfo?.name || 'CircuCity Seller',
                    address1: senderInfo?.address || 'Testgatan 1',
                    city: senderInfo?.city || 'Stockholm',
                    zipcode: senderInfo?.postalCode || '11122',
                    country_code: senderInfo?.countryCode || 'SE',
                },
                receiver: {
                    name: order.shippingName,
                    address1: order.shippingAddressLine1,
                    city: order.shippingCity,
                    zipcode: order.shippingPostalCode,
                    country_code: order.shippingCountry,
                    email: order.user?.email || undefined,
                },
                parcels: [
                    {
                        weight: weight || 1.0,
                        length: length || 30,
                        width: width || 30,
                        height: height || 15,
                        package_type: '02',
                    },
                ],
                reference: orderId,
            });

            carrierName = 'Shipmondo';
            shipmentResponse = {
                trackingNumber: shipmondoResult?.tracking_number || shipmondoResult?.id?.toString() || `SM-${Date.now()}`,
                labelUrl: shipmondoResult?.label?.url || shipmondoResult?.labels?.[0]?.url || null,
                labelBase64: shipmondoResult?.label?.base64 || null,
                shipmondoShipmentId: shipmondoResult?.id?.toString(),
                estimatedDelivery: shipmondoResult?.estimated_delivery || null,
            };
        } else {
            // Create PostNord shipment (existing flow)
            const postnordClient = getPostNordClient();

            const pnResponse = await postnordClient.createShipment({
                sender: {
                    name: senderInfo?.name || 'CircuCity Seller',
                    address: senderInfo?.address || 'Testgatan 1',
                    city: senderInfo?.city || 'Stockholm',
                    postalCode: senderInfo?.postalCode || '11122',
                    countryCode: senderInfo?.countryCode || 'SE',
                    phone: senderInfo?.phone,
                    email: senderInfo?.email,
                },
                recipient: {
                    name: order.shippingName,
                    address: order.shippingAddressLine1,
                    city: order.shippingCity,
                    postalCode: order.shippingPostalCode,
                    countryCode: order.shippingCountry,
                },
                parcel: {
                    weight: weight || 1.0,
                    length,
                    width,
                    height,
                },
                serviceCode,
                reference: orderId,
                labelFormat: 'PDF',
            });

            carrierName = 'PostNord';
            shipmentResponse = {
                trackingNumber: pnResponse.trackingNumber,
                labelUrl: pnResponse.labelUrl,
                labelBase64: pnResponse.labelBase64,
                postnordShipmentId: pnResponse.shipmentId,
                estimatedDelivery: pnResponse.estimatedDelivery,
            };
        }

        // Upload label to CDN (same logic for both carriers)
        let permanentCloudUrl = shipmentResponse.labelUrl || `/api/shipments/${shipmentResponse.trackingNumber}/label`;
        let uploadDebugInfo: any = shipmentResponse.labelUrl ? { status: 'using_cdn_url', url: shipmentResponse.labelUrl } : { status: 'skipped' };

        if (!shipmentResponse.labelUrl && shipmentResponse.labelBase64) {
            try {
                const utapi = new UTApi();
                const base64Data = shipmentResponse.labelBase64.split(',')[1] || shipmentResponse.labelBase64;
                const buffer = Buffer.from(base64Data, 'base64');

                const utResponse = await utapi.uploadFiles([
                    new File([buffer], `label-${shipmentResponse.trackingNumber}.pdf`, { type: 'application/pdf' })
                ]);

                if (utResponse[0]?.data?.url) {
                    permanentCloudUrl = utResponse[0].data.url;
                    uploadDebugInfo = { status: 'success', url: permanentCloudUrl };
                } else if (utResponse[0]?.error) {
                    uploadDebugInfo = { status: 'error', details: utResponse[0].error };
                } else {
                    uploadDebugInfo = { status: 'unknown', response: utResponse };
                }
            } catch (utErr: any) {
                uploadDebugInfo = { status: 'exception', error: utErr?.message || String(utErr) };
            }
        }

        const shipment = await prisma.shipment.create({
            data: {
                orderId,
                trackingNumber: shipmentResponse.trackingNumber,
                carrier: carrierName,
                serviceType: carrier === 'shipmondo' ? (serviceCode || 'Shipmondo') : serviceCode,
                status: 'PENDING',
                estimatedDelivery: shipmentResponse.estimatedDelivery
                    ? new Date(shipmentResponse.estimatedDelivery)
                    : null,
                senderName: senderInfo?.name || 'CircuCity Seller',
                senderAddress: senderInfo?.address || 'Testgatan 1',
                senderCity: senderInfo?.city || 'Stockholm',
                senderPostalCode: senderInfo?.postalCode || '11122',
                senderCountry: senderInfo?.countryCode || 'SE',
                recipientName: order.shippingName,
                recipientAddress: order.shippingAddressLine1,
                recipientCity: order.shippingCity,
                recipientPostalCode: order.shippingPostalCode,
                recipientCountry: order.shippingCountry,
                weight,
                length,
                width,
                height,
                postnordShipmentId: carrier === 'postnord' ? shipmentResponse.postnordShipmentId : null,
                shipmondoShipmentId: carrier === 'shipmondo' ? shipmentResponse.shipmondoShipmentId : null,
                labelUrl: permanentCloudUrl,
            },
        });

        // Update order status to SHIPPED
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'SHIPPED' },
        });

        // Notify buyer
        try {
            await sendNotification(
                order.userId,
                'Order Shipped',
                `Your order #${orderId.slice(-6)} has been shipped via ${carrierName}! Tracking: ${shipment.trackingNumber}`,
                'SUCCESS',
                `/dashboard/orders/${orderId}`
            );

            if (order.user?.email) {
                try {
                    await sendShipmentNotificationEmail({
                        to: order.user.email,
                        name: order.user.name,
                        trackingNumber: shipment.trackingNumber,
                        orderShortId: orderId.slice(-6)
                    });
                } catch (emailError) {
                    console.error('Failed to send shipment email:', emailError);
                }
            }
        } catch (notifError) {
            console.error('Failed to send shipping notification:', notifError);
        }

        return NextResponse.json({
            success: true,
            shipment: {
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                carrier: shipment.carrier,
                labelUrl: shipment.labelUrl,
                estimatedDelivery: shipment.estimatedDelivery,
            },
            debug: {
                upload: uploadDebugInfo
            }
        });
    } catch (error) {
        console.error('Error creating shipment:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        const isShipmondo = message.includes('Shipmondo');
        const isPostalCodeIssue = message.includes('post code') || message.includes('Post code') || message.includes('zipcode') || message.includes('Zipcode');
        const isDHL = message.includes('DHL');

        let suggestion = null;
        if (isShipmondo && (isPostalCodeIssue || isDHL)) {
            suggestion = 'The selected carrier (DHL Freight) does not support delivery to this postal code. Try using PostNord instead.';
        }

        return NextResponse.json(
            {
                error: 'Failed to create shipment',
                details: message,
                suggestion,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/shipments?orderId=xxx
 * Get all shipments for an order
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });

            if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const shipments = await prisma.shipment.findMany({
            where: { orderId },
            include: {
                trackingEvents: {
                    orderBy: { timestamp: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ shipments });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipments' },
            { status: 500 }
        );
    }
}
