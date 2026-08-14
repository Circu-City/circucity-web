'use client';

import { useEffect, useState } from 'react';
import { Package, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

interface TrackingEvent {
    id: string;
    status: string;
    description: string | null;
    location: string | null;
    timestamp: string;
}

interface Shipment {
    id: string;
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
    labelUrl?: string | null;
    trackingEvents: TrackingEvent[];
}

interface ShipmentTrackerProps {
    orderId: string;
    showLabelButton?: boolean;
}

export default function ShipmentTracker({ orderId, showLabelButton = false }: ShipmentTrackerProps) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchShipments = async () => {
        try {
            const response = await fetch(`/api/shipments?orderId=${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch shipments');
            }
            const data = await response.json();
            setShipments(data.shipments);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const refreshTracking = async (trackingNumber: string) => {
        setRefreshing(true);
        try {
            const response = await fetch(
                `/api/shipments/${trackingNumber}/track`
            );
            if (!response.ok) {
                throw new Error('Failed to refresh tracking');
            }
            const data = await response.json();

            // Update the shipment in the list
            setShipments((prev) =>
                prev.map((s) =>
                    s.trackingNumber === trackingNumber ? data.shipment : s
                )
            );
        } catch (err) {
            console.error('Error refreshing tracking:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const downloadLabel = async (labelUrl: string, trackingNumber: string) => {
        try {
            // If the URL is external (e.g. UploadThing), we should use direct download or window.open
            // to avoid CORS issues with fetch()
            if (labelUrl.startsWith('http')) {
                // Direct download via window.open is more reliable for external CDN links
                window.open(labelUrl, '_blank');
                return;
            }

            // For internal relative URLs (dynamic API route), we use fetch for secure retrieval
            const response = await fetch(labelUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to download label');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shipping-label-${trackingNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading label:', error);
            alert(`Could not download label: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error: {error}</p>
            </div>
        );
    }

    if (shipments.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No shipments found for this order</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'IN_TRANSIT':
            case 'OUT_FOR_DELIVERY':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'FAILED_DELIVERY':
            case 'RETURNED':
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'IN_TRANSIT':
            case 'OUT_FOR_DELIVERY':
                return 'bg-blue-100 text-blue-800';
            case 'FAILED_DELIVERY':
            case 'RETURNED':
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {shipments.map((shipment) => (
                <div
                    key={shipment.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(shipment.status)}
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {shipment.carrier} Shipment
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Tracking: {shipment.trackingNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}
                                >
                                    {shipment.status.replace(/_/g, ' ')}
                                </span>
                                {showLabelButton && (
                                    <button
                                        onClick={() => {
                                            const downloadUrl = shipment.labelUrl || `/api/shipments/${shipment.trackingNumber}/label`;
                                            downloadLabel(downloadUrl, shipment.trackingNumber);
                                        }}
                                        className="px-4 py-2 bg-[#2D5F3F] text-white rounded-md hover:bg-[#2D5F3F]/90 text-sm font-medium transition-colors"
                                    >
                                        Reprint Label
                                    </button>
                                )}
                                <button
                                    onClick={() => refreshTracking(shipment.trackingNumber)}
                                    disabled={refreshing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start space-x-2">
                                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Estimated Delivery
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(shipment.estimatedDelivery)}
                                    </p>
                                </div>
                            </div>
                            {shipment.actualDelivery && (
                                <div className="flex items-start space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Delivered On
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {formatDate(shipment.actualDelivery)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="px-6 py-4">
                        <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
                        {shipment.trackingEvents.length > 0 ? (
                            <div className="space-y-4">
                                {shipment.trackingEvents.map((event, index) => (
                                    <div key={event.id} className="flex space-x-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                                                    }`}
                                            ></div>
                                            {index < shipment.trackingEvents.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {event.status}
                                                    </p>
                                                    {event.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    {event.location && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <MapPin className="h-3 w-3 text-gray-400" />
                                                            <p className="text-xs text-gray-500">
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                    {formatDate(event.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No tracking events available yet
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
