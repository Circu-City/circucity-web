import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { cache } from 'react';

// Use React.cache to ensure that if checkRole is called multiple times per request
// (e.g. in Navbar, Layout, Page), it only consumes ONE database connection!
export const getUserRoleFromDb = cache(async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
});

/**
 * Check a user's role using the DATABASE as the source of truth.
 *
 * Previously this read from Clerk sessionClaims (`metadata.role`), which are
 * only updated when a new JWT is issued — meaning role changes made by an admin
 * in the dashboard would NOT be reflected until the user's session expired and
 * they logged in again.
 *
 * Now we read directly from the DB so role changes take effect immediately.
 */
export const checkRole = async (role: 'admin' | 'seller') => {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await getUserRoleFromDb(userId);

    if (!user) return false;

    if (role === 'admin') return user.role === 'ADMIN';
    if (role === 'seller') return user.role === 'SELLER' || user.role === 'ADMIN';

    return false;
};
