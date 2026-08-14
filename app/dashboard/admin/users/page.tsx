import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { User, Shield, ShieldAlert, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminSearch } from '@/components/admin/Search';
import { UserRoleMakeAdmin } from './UserRoleActions';
import { EditUserButton, DeleteUserButton } from './UserEditActions';

const USERS_PER_PAGE = 10;

export default async function AdminUsersPage(props: {
    searchParams?: Promise<{ q?: string; role?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const roleFilter = searchParams?.role;
    const page = Math.max(1, Number(searchParams?.page) || 1);

    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { email: { contains: query } },
        ];
    }

    if (roleFilter && roleFilter !== 'ALL') {
        where.role = roleFilter;
    }

    const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * USERS_PER_PAGE,
            take: USERS_PER_PAGE,
        }),
        prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

    function buildPageUrl(p: number) {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (roleFilter && roleFilter !== 'ALL') params.set('role', roleFilter);
        if (p > 1) params.set('page', String(p));
        const qs = params.toString();
        return `/dashboard/admin/users${qs ? `?${qs}` : ''}`;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">Manage {totalUsers} registered users</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense fallback={<div className="w-full max-w-sm h-10 bg-gray-100 rounded-md animate-pulse" />}>
                        <AdminSearch placeholder="Search users by name or email..." />
                    </Suspense>
                    <Link
                        href="/dashboard/admin/users"
                        className="px-3 py-2 bg-white border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Joined</TableHead>
                            <TableHead className="text-right w-[180px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="font-medium">No users found</p>
                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 text-gray-400">
                                            {user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.image} alt={user.name || ''} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900">{user.name || 'No Name'}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`
                                                flex w-fit items-center gap-1 font-medium
                                                ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                ${user.role === 'SELLER' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${user.role === 'BUYER' ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                                            `}
                                        >
                                            {user.role === 'ADMIN' && <ShieldAlert className="w-3 h-3" />}
                                            {user.role === 'SELLER' && <Shield className="w-3 h-3" />}
                                            {user.role === 'BUYER' && <User className="w-3 h-3" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500 tabular-nums">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <UserRoleMakeAdmin userId={user.id} currentRole={user.role} />
                                            <EditUserButton userId={user.id} currentName={user.name} currentEmail={user.email} />
                                            <DeleteUserButton userId={user.id} userName={user.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">
                        Showing {((page - 1) * USERS_PER_PAGE) + 1} to {Math.min(page * USERS_PER_PAGE, totalUsers)} of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-1">
                        <Link
                            href={buildPageUrl(page - 1)}
                            className={`p-2 rounded-lg transition-colors ${page <= 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
                            aria-disabled={page <= 1}
                            tabIndex={page <= 1 ? -1 : undefined}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={buildPageUrl(p)}
                                className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                    p === page
                                        ? 'bg-[#2D5F3F] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {p}
                            </Link>
                        ))}
                        <Link
                            href={buildPageUrl(page + 1)}
                            className={`p-2 rounded-lg transition-colors ${page >= totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
                            aria-disabled={page >= totalPages}
                            tabIndex={page >= totalPages ? -1 : undefined}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
