'use client';

import { useState } from 'react';
import { Package, Truck, AlertCircle, Ship } from 'lucide-react';

interface CreateShipmentFormProps {
    orderId: string;
    onShipmentCreated?: () => void;
}

export default function CreateShipmentForm({
    orderId,
    onShipmentCreated,
}: CreateShipmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [carrier, setCarrier] = useState<'postnord' | 'shipmondo'>('postnord');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        serviceCode: '19',
        weight: '1.0',
        length: '',
        width: '',
        height: '',
        senderName: '',
        senderAddress: '',
        senderCity: '',
        senderPostalCode: '',
        senderCountryCode: 'SE',
        senderPhone: '',
        senderEmail: '',
        shipmondoTemplateId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuggestion(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    carrier,
                    serviceCode: formData.serviceCode,
                    weight: parseFloat(formData.weight),
                    length: formData.length ? parseFloat(formData.length) : undefined,
                    width: formData.width ? parseFloat(formData.width) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    shipmondoTemplateId: formData.shipmondoTemplateId || undefined,
                    senderInfo: {
                        name: formData.senderName,
                        address: formData.senderAddress,
                        city: formData.senderCity,
                        postalCode: formData.senderPostalCode,
                        countryCode: formData.senderCountryCode,
                        phone: formData.senderPhone,
                        email: formData.senderEmail,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.suggestion) {
                    setSuggestion(errorData.suggestion);
                }
                throw new Error(errorData.details || errorData.error || 'Failed to create shipment');
            }

            const data = await response.json();
            setSuccess(true);

            if (data.shipment.labelUrl) {
                try {
                    const labelUrl = data.shipment.labelUrl;

                    if (labelUrl.startsWith('http')) {
                        window.open(labelUrl, '_blank');
                    } else {
                        const labelRes = await fetch(labelUrl);
                        if (labelRes.ok) {
                            const blob = await labelRes.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `label-${data.shipment.trackingNumber || 'label'}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        } else {
                            const errorData = await labelRes.json();
                            console.error('Failed to auto-download label. Details:', errorData.details || errorData.error);
                        }
                    }
                } catch (dlErr) {
                    console.error('Error auto-downloading label:', dlErr);
                }
            }

            if (onShipmentCreated) {
                onShipmentCreated();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-green-600" />
                    <div>
                        <h3 className="font-semibold text-green-900">Shipment Created!</h3>
                        <p className="text-sm text-green-700 mt-1">
                            The shipment has been created successfully. The shipping label should download automatically.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Create Shipment</h3>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="font-medium text-red-900">Error</p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                                {suggestion && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                        <p className="text-sm font-medium text-amber-900">Suggestion</p>
                                        <p className="text-sm text-amber-700 mt-1">{suggestion}</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCarrier('postnord');
                                                setSuggestion(null);
                                                setError(null);
                                            }}
                                            className="mt-2 px-4 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 font-medium transition-colors"
                                        >
                                            Switch to PostNord
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Carrier Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Carrier
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setCarrier('postnord')}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                                carrier === 'postnord'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <Truck className="w-5 h-5" />
                            PostNord
                        </button>
                        <button
                            type="button"
                            onClick={() => setCarrier('shipmondo')}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                                carrier === 'shipmondo'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <Ship className="w-5 h-5" />
                            Shipmondo
                        </button>
                    </div>
                </div>

                {/* PostNord Service */}
                {carrier === 'postnord' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PostNord Service
                        </label>
                        <select
                            name="serviceCode"
                            value={formData.serviceCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="19">MyPack Home (Standard Parcel)</option>
                            <option value="17">MyPack Collect (Pickup Point)</option>
                            <option value="15">Express Parcel</option>
                        </select>
                    </div>
                )}

                {/* Shipmondo Settings */}
                {carrier === 'shipmondo' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shipmondo Template ID
                        </label>
                        <input
                            type="text"
                            name="shipmondoTemplateId"
                            value={formData.shipmondoTemplateId}
                            onChange={handleChange}
                            placeholder="e.g. 123456"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Find your template ID in Shipmondo Dashboard → Shipment Templates.
                            Leave empty to use default template.
                        </p>
                    </div>
                )}

                {/* Package Dimensions */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Package Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg) *
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                step="0.1"
                                min="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Length (cm)
                            </label>
                            <input
                                type="number"
                                name="length"
                                value={formData.length}
                                onChange={handleChange}
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Width (cm)
                            </label>
                            <input
                                type="number"
                                name="width"
                                value={formData.width}
                                onChange={handleChange}
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Sender Information */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Sender Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sender Name *
                            </label>
                            <input
                                type="text"
                                name="senderName"
                                value={formData.senderName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="senderAddress"
                                value={formData.senderAddress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                name="senderCity"
                                value={formData.senderCity}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code *
                            </label>
                            <input
                                type="text"
                                name="senderPostalCode"
                                value={formData.senderPostalCode}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country Code *
                            </label>
                            <select
                                name="senderCountryCode"
                                value={formData.senderCountryCode}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="SE">Sweden (SE)</option>
                                <option value="DK">Denmark (DK)</option>
                                <option value="NO">Norway (NO)</option>
                                <option value="FI">Finland (FI)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="senderPhone"
                                value={formData.senderPhone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="senderEmail"
                                value={formData.senderEmail}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {loading ? 'Creating Shipment...' : 'Create Shipment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
