'use client';

import { Role } from '@prisma/client';
import { updateUserRole } from './actions';
import { toast } from 'sonner';
import { Shield, ShieldAlert, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function UserRoleMakeAdmin({ userId, currentRole }: { userId: string, currentRole: Role }) {
    const handleRoleChange = async (role: Role) => {
        const result = await updateUserRole(userId, role);
        if (result.success) {
            toast.success(`User role updated to ${role}`);
        } else {
            toast.error('Failed to update user role');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    Manage Role
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => handleRoleChange('ADMIN')}
                    disabled={currentRole === 'ADMIN'}
                    className={currentRole === 'ADMIN' ? "bg-accent" : ""}
                >
                    <ShieldAlert className="mr-2 h-4 w-4 text-red-600" />
                    <span>Admin</span>
                    {currentRole === 'ADMIN' && <Check className="ml-auto h-3 w-3" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRoleChange('SELLER')}
                    disabled={currentRole === 'SELLER'}
                    className={currentRole === 'SELLER' ? "bg-accent" : ""}
                >
                    <Shield className="mr-2 h-4 w-4 text-green-600" />
                    <span>Seller</span>
                    {currentRole === 'SELLER' && <Check className="ml-auto h-3 w-3" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRoleChange('BUYER')}
                    disabled={currentRole === 'BUYER'}
                    className={currentRole === 'BUYER' ? "bg-accent" : ""}
                >
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    <span>Buyer</span>
                    {currentRole === 'BUYER' && <Check className="ml-auto h-3 w-3" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
