'use client';

import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateUserProfile, deleteUser } from './actions';
import { toast } from 'sonner';

export function EditUserButton({ userId, currentName, currentEmail }: { userId: string; currentName: string | null; currentEmail: string }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(currentName || '');
    const [email, setEmail] = useState(currentEmail);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const result = await updateUserProfile(userId, { name, email });
        setLoading(false);
        if (result.success) {
            toast.success('User updated');
            setOpen(false);
        } else {
            toast.error(result.error || 'Failed to update');
        }
    };

    return (
        <>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(true)} title="Edit user">
                <Pencil className="h-4 w-4 text-gray-500" />
            </Button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                            <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                            </div>
                            <Button onClick={handleSave} disabled={loading} className="w-full bg-[#2D5F3F] hover:bg-[#1a3a28]">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string | null }) {
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteUser(userId);
        setLoading(false);
        if (result.success) {
            toast.success(`User "${userName || 'Unknown'}" deleted`);
            setConfirm(false);
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    };

    if (!confirm) {
        return (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setConfirm(true)} title="Delete user">
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        );
    }

    return (
        <span className="flex items-center gap-1">
            <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Confirm'}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setConfirm(false)}>
                <X className="h-3 w-3" />
            </Button>
        </span>
    );
}
