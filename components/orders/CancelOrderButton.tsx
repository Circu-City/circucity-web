'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

interface CancelOrderButtonProps {
    orderId: string;
    status: OrderStatus;
}

export function CancelOrderButton({ orderId, status }: CancelOrderButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if order can be cancelled
    const canCancel = status === 'PENDING' || status === 'PAID';

    if (!canCancel) {
        return null;
    }

    const handleCancel = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason || 'Customer requested cancellation' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel order');
            }

            toast.success('Order cancelled successfully', {
                description: data.refundId ? 'Refund has been processed' : 'Your order has been cancelled'
            });

            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order', {
                description: error.message || 'Please try again later'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Cancel Order?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                        <p>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        {status === 'PAID' && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-900">
                                    <strong>Refund Information:</strong> A full refund will be processed automatically to your original payment method. It may take 5-10 business days to appear.
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Reason for cancellation (optional)
                            </label>
                            <Textarea
                                placeholder="e.g., Changed my mind, found a better price, etc."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Keep Order
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleCancel();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
