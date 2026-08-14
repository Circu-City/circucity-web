import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ShipmentTracker from '@/components/shipment/ShipmentTracker';
import CreateShipmentForm from '@/components/shipment/CreateShipmentForm';
import { Package, MapPin, User, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getProductImages } from '@/lib/utils';
import Image from 'next/image';

interface SellerOrderDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SellerOrderDetailsPage({
    params,
}: SellerOrderDetailsPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const { id: orderId } = await params;

    // Get seller's shop
    const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
    });

    if (!shop) {
        redirect('/become-seller');
    }

    // Fetch order details - only items from this seller's shop
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            items: {
                some: {
                    product: {
                        shopId: shop.id,
                    },
                },
            },
        },
        include: {
            user: true,
            items: {
                where: {
                    product: {
                        shopId: shop.id,
                    },
                },
                include: {
                    product: true,
                },
            },
            shipments: {
                include: {
                    trackingEvents: {
                        orderBy: { timestamp: 'desc' },
                    },
                },
            },
        },
    });

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
                <p className="text-gray-600 mt-2">
                    This order doesn&apos;t exist or doesn&apos;t contain your products.
                </p>
            </div>
        );
    }

    // Determine if this is a swap order awaiting shipping payment
    const isSwapOrder = (order.stripeChargeId || '').startsWith('swap_');
    const shippingNotPaid = isSwapOrder && !order.shippingName;

    // Calculate shop's total
    const shopTotal = order.items.reduce((acc, item) => {
        return acc + Number(item.price) * item.quantity;
    }, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                    <p className="text-gray-600 mt-1">
                        Order #{orderId.slice(-8).toUpperCase()}
                    </p>
                </div>
                <Badge
                    variant={order.status === 'PAID' ? 'default' : 'secondary'}
                    className={
                        order.status === 'PAID'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 text-lg px-4 py-2'
                            : order.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 text-lg px-4 py-2'
                                : order.status === 'DELIVERED'
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 text-lg px-4 py-2'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-100 text-lg px-4 py-2'
                    }
                >
                    {order.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Your Items in This Order
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                                >
                                    {getProductImages(item.product.images)[0] && (
                                        <Image
                                            src={getProductImages(item.product.images)[0]}
                                            alt={item.product.name}
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 object-cover rounded-md border border-gray-200"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Quantity: {item.quantity} × {Number(item.price).toFixed(2)} Kr
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {(Number(item.price) * item.quantity).toFixed(2)} Kr
                                    </p>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">
                                        Your Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {shopTotal.toFixed(2)} Kr
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Swap: Awaiting Shipping Payment */}
                    {shippingNotPaid && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Package className="h-6 w-6 text-yellow-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-yellow-900 text-lg">
                                        Swap Accepted — Awaiting Shipping Payment
                                    </h3>
                                    <p className="text-yellow-700 mt-1">
                                        The buyer has paid with EcoTokens and needs to pay for
                                        shipping. They will be prompted to enter their shipping
                                        address and pay. Once completed, the shipping address
                                        will appear here and you can create the shipment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipment Section */}
                    {order.status === 'PAID' && !shippingNotPaid && order.shipments.length === 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Package className="h-6 w-6 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 text-lg">
                                        Action Required: Create Shipment
                                    </h3>
                                    <p className="text-blue-700 mt-1">
                                        The customer has paid for this order. Create a shipment to
                                        generate a shipping label and notify the customer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create Shipment Form */}
                    {order.status === 'PAID' && !shippingNotPaid && order.shipments.length === 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Create Shipment
                            </h2>
                            <CreateShipmentForm orderId={order.id} />
                        </div>
                    )}

                    {/* Shipment Tracking */}
                    {order.shipments.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Shipment Tracking
                            </h2>
                            <ShipmentTracker orderId={order.id} showLabelButton={true} />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Order Summary
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className="font-medium text-gray-900">
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Your Total</span>
                                <span className="font-semibold text-gray-900">
                                    {shopTotal.toFixed(2)} Kr
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Date</span>
                                <span className="text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {order.shipments.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipments</span>
                                    <span className="font-medium text-gray-900">
                                        {order.shipments.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">
                                    {order.user?.name || 'Guest'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900">{order.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingName && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Shipping Address
                                </h2>
                            </div>
                            <div className="p-6">
                                <p className="font-medium text-gray-900">{order.shippingName}</p>
                                <p className="text-gray-600 mt-2">{order.shippingAddressLine1}</p>
                                {order.shippingAddressLine2 && (
                                    <p className="text-gray-600">{order.shippingAddressLine2}</p>
                                )}
                                <p className="text-gray-600">
                                    {order.shippingCity}, {order.shippingState}{' '}
                                    {order.shippingPostalCode}
                                </p>
                                <p className="text-gray-600">{order.shippingCountry}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
