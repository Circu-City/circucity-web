'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { Loader2, RefreshCcw } from 'lucide-react';
import { processRefund } from './actions';

interface RefundDialogProps {
    orderId: string;
    orderTotal: number;
    currentStatus: string;
}

export function RefundDialog({ orderId, orderTotal, currentStatus }: RefundDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL'>('FULL');
    const [amount, setAmount] = useState<string>(orderTotal.toString());
    const [reason, setReason] = useState('');

    const handleRefund = async () => {
        setIsLoading(true);
        try {
            const refundAmount = parseFloat(amount);
            if (refundType === 'PARTIAL' && (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > orderTotal)) {
                toast.error('Invalid refund amount');
                setIsLoading(false);
                return;
            }

            const result = await processRefund(
                orderId,
                refundType,
                refundType === 'PARTIAL' ? refundAmount : undefined,
                reason
            );

            if (result.success) {
                toast.success('Refund processed successfully');
                setIsOpen(false);
            } else {
                toast.error(result.error || 'Failed to process refund');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const isRefunded = currentStatus === 'REFUNDED' || currentStatus === 'PARTIALLY_REFUNDED';

    if (isRefunded) {
        return (
            <Button variant="outline" disabled className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Refund Processed
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Process Refund
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogDescription>
                        Issue a full or partial refund for this order. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <RadioGroup defaultValue="FULL" onValueChange={(v) => setRefundType(v as 'FULL' | 'PARTIAL')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FULL" id="full" />
                            <Label htmlFor="full">Full Refund ({orderTotal.toFixed(2)} Kr)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PARTIAL" id="partial" />
                            <Label htmlFor="partial">Partial Refund</Label>
                        </div>
                    </RadioGroup>

                    {refundType === 'PARTIAL' && (
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                max={orderTotal}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Refund</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Customer returned item, Damaged goods..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleRefund} disabled={isLoading} variant="destructive">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
