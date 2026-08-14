'use client';

import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'DISPUTED';

interface OrderTrackerProps {
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
    cancelledAt?: Date | null;
}

const statusConfig: Record<OrderStatus, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    description: string;
}> = {
    PENDING: {
        label: 'Pending',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        description: 'Your order is being processed'
    },
    PAID: {
        label: 'Paid',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Payment confirmed, preparing for shipment'
    },
    SHIPPED: {
        label: 'Shipped',
        icon: Truck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Your order is on its way'
    },
    DELIVERED: {
        label: 'Delivered',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Order has been delivered'
    },
    CANCELLED: {
        label: 'Cancelled',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        description: 'Order has been cancelled'
    },
    REFUNDED: {
        label: 'Refunded',
        icon: XCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Full refund processed'
    },
    PARTIALLY_REFUNDED: {
        label: 'Partially Refunded',
        icon: XCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Partial refund processed'
    },
    DISPUTED: {
        label: 'Disputed',
        icon: XCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        description: 'Payment disputed, under review'
    }
};

const orderSteps: Array<{ status: OrderStatus; label: string }> = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'PAID', label: 'Payment Confirmed' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' }
];

export function OrderTracker({ status, createdAt, updatedAt, cancelledAt }: OrderTrackerProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    // Determine current step index
    const currentStepIndex = orderSteps.findIndex(step => step.status === status);
    const isCancelled = status === 'CANCELLED' || status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED' || status === 'DISPUTED';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    Order Tracking
                </h3>
                <Badge className={`${config.bgColor} ${config.color} border-transparent`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-6">{config.description}</p>

            {!isCancelled ? (
                <div className="space-y-4">
                    {orderSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.status} className="flex items-start gap-4">
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                            } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                                        )}
                                    </div>
                                    {index < orderSteps.length - 1 && (
                                        <div
                                            className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="flex-1 pb-8">
                                    <p
                                        className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Updated {new Date(updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                    {index === 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(createdAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{config.label}</p>
                        {cancelledAt && (
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(cancelledAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Estimated delivery (only for active orders) */}
            {status === 'SHIPPED' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-sm text-blue-700 mt-1">
                        {new Date(new Date(updatedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {' '}
                        {new Date(new Date(updatedAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
}
