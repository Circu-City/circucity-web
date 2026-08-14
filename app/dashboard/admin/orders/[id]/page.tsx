
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft, Package, Calendar, MapPin, CreditCard, User, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ReceiptPrinter } from '@/components/orders/ReceiptPrinter';
import { OrderTracker } from '@/components/orders/OrderTracker';
import { CancelOrderButton } from '@/components/orders/CancelOrderButton';
import ShipmentTracker from '@/components/shipment/ShipmentTracker';
import { RefundDialog } from './RefundDialog';
import { getProductImages } from '@/lib/utils';


export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const order = await prisma.order.findUnique({
        where: {
            id: params.id,
        },
        include: {
            user: true, // Include customer details
            items: {
                include: {
                    product: {
                        include: {
                            shop: true // Include shop details for each product
                        }
                    }
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

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Link href="/dashboard/admin/orders" className="text-sm text-gray-500 hover:text-gray-900 flex items-center transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                    </Link>
                    <div className="flex gap-2">
                        {/* Admin specific actions could go here */}
                        <RefundDialog
                            orderId={order.id}
                            orderTotal={Number(order.total)}
                            currentStatus={order.status}
                        />
                        <ReceiptPrinter order={orderData} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Order #{order.id.slice(-8).toUpperCase()}
                            </h1>
                            <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Badge variant="outline" className="text-gray-600 border-gray-300">
                                Total: {Number(order.total).toFixed(2)} Kr
                            </Badge>
                            <Badge
                                className={`
                                    ${order.status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                    ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                    ${order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' : ''}
                                    ${order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                `}
                            >
                                {order.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 font-medium text-gray-700 flex items-center gap-2">
                                <Package className="w-4 h-4" /> Order Items ({order.items.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {getProductImages(item.product.images)[0] && (
                                                <Image
                                                    src={getProductImages(item.product.images)[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Shop: {item.product.shop.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {Number(item.price).toFixed(2)} Kr</p>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {(Number(item.price) * item.quantity).toFixed(2)} Kr
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 mr-4">Total Amount</span>
                                    <span className="font-bold text-lg text-gray-900">{dummyTotal(order.total)} Kr</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipment Tracking */}
                        {order.shipments && order.shipments.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 font-medium text-gray-700">
                                    Tracking Information
                                </div>
                                <div className="p-4">
                                    <ShipmentTracker orderId={order.id} showLabelButton={true} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Customer & Address */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" /> Customer Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {order.user.image ? <img src={order.user.image} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-gray-400" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{order.user.name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-500">ID: {order.user.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-100 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-3.5 h-3.5" />
                                        <a href={`mailto:${order.user.email}`} className="hover:text-blue-600 hover:underline">{order.user.email}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" /> Shipping Address
                            </h3>
                            {order.shippingAddressLine1 ? (
                                <address className="not-italic text-sm text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-900 mb-1">{order.shippingName}</p>
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
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" /> Payment Information
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex justify-between">
                                    <span>Method:</span>
                                    <span className="font-medium text-gray-900">Stripe</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <Badge variant="outline" className={`
                                        text-xs font-normal
                                        ${order.status === 'PAID' ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-600'}
                                    `}>
                                        {order.status === 'PAID' ? 'Successful' : order.status}
                                    </Badge>
                                </div>
                                {order.stripeChargeId && (
                                    <div className="pt-2 mt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-400">Transaction ID:</p>
                                        <p className="text-xs font-mono text-gray-500 truncate">{order.stripeChargeId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function dummyTotal(decimal: any) {
    return Number(decimal).toFixed(2);
}
