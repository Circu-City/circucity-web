
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, Package, Calendar, MapPin, CreditCard, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ReceiptPrinter } from '@/components/orders/ReceiptPrinter';
import { OrderTracker } from '@/components/orders/OrderTracker';
import { CancelOrderButton } from '@/components/orders/CancelOrderButton';
import PaySwapShipping from '@/components/orders/PaySwapShipping';
import ShipmentTracker from '@/components/shipment/ShipmentTracker';
import { formatPrice } from '@/lib/pricing';
import { getProductImages } from '@/lib/utils';

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const order = await prisma.order.findUnique({
        where: {
            id: params.id,
            userId: userId // Ensure user owns the order
        },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            shipments: {
                include: {
                    trackingEvents: {
                        orderBy: { timestamp: 'desc' }
                    }
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Transform for client component
    const orderData = {
        ...order,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        cancelledAt: order.cancelledAt,
        total: Number(order.total),
        refundAmount: order.refundAmount ? Number(order.refundAmount) : null,
        feeGross: order.feeGross ? Number(order.feeGross) : null,
        items: order.items.map(item => ({
            ...item,
            price: Number(item.price)
        }))
    };

    const itemSubtotal = order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const feeGross = Number(order.feeGross || 0);
    const total = Number(order.total);
    const shipping = total - itemSubtotal - feeGross;

    return (
        <div className="min-h-screen bg-[#f8f5f2] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link href="/dashboard/orders" className="text-sm text-gray-500 hover:text-[#2D5F3F] flex items-center transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                    </Link>
                    <ReceiptPrinter order={orderData} />
                </div>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Order #{order.id.slice(-6).toUpperCase()}
                                </h1>
                                <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <Badge variant="outline" className="text-gray-600 border-gray-300 px-3 py-1">
                                    Total: {formatPrice(Number(order.total))}
                                </Badge>
                                <Badge
                                    className={`px-3 py-1 ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {order.status}
                                </Badge>
                                <CancelOrderButton orderId={order.id} status={order.status as any} />
                            </div>
                        </div>

                        {/* Refund info */}
                        {(order.status === 'REFUNDED' || order.status === 'PARTIALLY_REFUNDED') && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-sm font-medium text-purple-900">
                                    {order.status === 'REFUNDED' ? 'Full Refund Processed' : 'Partial Refund Processed'}
                                </p>
                                <p className="text-sm text-purple-700 mt-1">
                                    Amount refunded: {formatPrice(Number(order.refundAmount || order.total))}
                                </p>
                                {order.cancellationReason && (
                                    <p className="text-xs text-purple-600 mt-2">
                                        Reason: {order.cancellationReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Col: Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 bg-gray-50/50 font-medium text-gray-700 flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Items ({order.items.length})
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                <Image
                                                    src={getProductImages(item.product.images)[0] || '/placeholder.png'}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {formatPrice(Number(item.price))} each
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">
                                                        {formatPrice(Number(item.price) * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Item Subtotal</span>
                                        <span>{formatPrice(itemSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Shipping & Handling</span>
                                        <span>{formatPrice(Math.max(0, shipping))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Shield Fee</span>
                                        <span>{formatPrice(feeGross)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Total</span>
                                        <span className="font-bold text-lg">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Swap Shipping Payment */}
                            <PaySwapShipping
                                orderId={order.id}
                                stripeChargeId={order.stripeChargeId}
                                total={Number(order.total)}
                                paid={!!order.shippingName}
                            />

                            {/* Shipment Tracking */}
                            {order.shipments && order.shipments.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 font-medium text-gray-700">
                                        Delivery Tracking
                                    </div>
                                    <div className="p-4">
                                        <ShipmentTracker orderId={order.id} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Col: Info */}
                        <div className="space-y-6">
                            {/* Order Tracking */}
                            <OrderTracker
                                status={order.status as any}
                                createdAt={order.createdAt}
                                updatedAt={order.updatedAt}
                                cancelledAt={order.cancelledAt}
                            />

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" /> Shipping Address
                                </h3>
                                {order.shippingAddressLine1 ? (
                                    <address className="not-italic text-sm text-gray-600 space-y-1">
                                        <p className="font-medium text-gray-900">{order.shippingName}</p>
                                        <p>{order.shippingAddressLine1}</p>
                                        {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                                        <p>{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>
                                        <p>{order.shippingCountry}</p>
                                    </address>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No shipping address provided.</p>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gray-500" /> Payment
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>Paid via Stripe</p>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Payment Secure
                                    </p>
                                    {order.stripeChargeId && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Charge ID: {order.stripeChargeId.slice(0, 20)}...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
