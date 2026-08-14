'use client';

import { updatePayoutStatus } from './actions';
import { toast } from 'sonner';
import { Check, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PayoutActions({ payoutId, currentStatus }: { payoutId: string; currentStatus: string }) {
    const handleAction = async (status: string) => {
        const labels: Record<string, string> = {
            PROCESSING: 'Processing',
            PAID: 'Paid',
            FAILED: 'Failed',
        };
        const result = await updatePayoutStatus(payoutId, status as any);
        if (result.success) {
            toast.success(`Payout marked as ${labels[status] || status}`);
        } else {
            toast.error(result.error || 'Failed');
        }
    };

    if (currentStatus === 'PAID' || currentStatus === 'FAILED') {
        return <span className="text-xs text-gray-400">Final</span>;
    }

    return (
        <div className="flex items-center justify-end gap-1">
            {currentStatus === 'PENDING' && (
                <>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction('PROCESSING')}>
                        <RotateCw className="w-3 h-3 mr-1" /> Process
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={() => handleAction('PAID')}>
                        <Check className="w-3 h-3 mr-1" /> Pay
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => handleAction('FAILED')}>
                        <X className="w-3 h-3" />
                    </Button>
                </>
            )}
            {currentStatus === 'PROCESSING' && (
                <>
                    <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={() => handleAction('PAID')}>
                        <Check className="w-3 h-3 mr-1" /> Mark Paid
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => handleAction('FAILED')}>
                        <X className="w-3 h-3 mr-1" /> Fail
                    </Button>
                </>
            )}
        </div>
    );
}
