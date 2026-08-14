'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePayoutStatus } from './actions';
import { toast } from 'sonner';

export function BulkPayoutActions({ pendingIds }: { pendingIds: string[] }) {
    const [loading, setLoading] = useState(false);

    const handleMarkAllPaid = async () => {
        if (!confirm(`Mark ${pendingIds.length} pending payout(s) as PAID?`)) return;
        setLoading(true);
        let count = 0; let error: string | null = null; for (const id of pendingIds) { try { await updatePayoutStatus(id, 'PAID'); count++; } catch (e) { error = (e instanceof Error ? e.message : String(e)); } } const result = { success: count > 0, count, error };
        setLoading(false);
        if (result.success) {
            toast.success(`${result.count} payout(s) marked as PAID`);
        } else {
            toast.error(result.error || 'Failed');
        }
    };

    return (
        <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={handleMarkAllPaid} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
            {loading ? 'Processing...' : `Mark All Pending as PAID (${pendingIds.length})`}
        </Button>
    );
}
