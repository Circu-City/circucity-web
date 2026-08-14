'use client';

import { ShopStatus } from '@prisma/client';
import { updateShopStatus } from './actions';
import { toast } from 'sonner';
import { Check, X, Ban, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ShopStatusActions({ shopId, currentStatus }: { shopId: string, currentStatus: ShopStatus }) {
    const handleStatusChange = async (status: ShopStatus) => {
        const result = await updateShopStatus(shopId, status);
        if (result.success) {
            toast.success(`Shop status updated to ${status}`);
        } else {
            toast.error('Failed to update shop status');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    Actions
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {currentStatus !== 'ACTIVE' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Approve / Activate
                    </DropdownMenuItem>
                )}
                {currentStatus !== 'SUSPENDED' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('SUSPENDED')}>
                        <Ban className="mr-2 h-4 w-4 text-red-600" />
                        Suspend
                    </DropdownMenuItem>
                )}
                {currentStatus !== 'REJECTED' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('REJECTED')}>
                        <X className="mr-2 h-4 w-4 text-red-600" />
                        Reject
                    </DropdownMenuItem>
                )}
                {/* Reset to Pending option for testing or edge cases */}
                {currentStatus !== 'PENDING' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('PENDING')}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-gray-600" />
                        Mark as Pending
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
