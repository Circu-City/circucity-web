'use server';

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type RegisterShopState = {
    success: boolean;
    message?: string;
    redirectUrl?: string;
};

export async function registerShop(formData: FormData): Promise<RegisterShopState> {
    // Authenticate user
    const user = await currentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const userId = user.id;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    // Parse Form Data
    const shopName = formData.get("shopName") as string;
    const description = formData.get("description") as string;
    const sellerType = formData.get("sellerType") as "PRIVATE" | "BUSINESS";
    const organizationNumber = formData.get("organizationNumber") as string | null;

    if (!shopName || !description) {
        return {
            success: false,
            message: "Missing required fields: Shop Name and Description."
        };
    }

    try {
        // Check if user already has a shop
        const existingShop = await prisma.shop.findUnique({
            where: { ownerId: userId },
        });

        if (existingShop) {
            return {
                success: false,
                message: "You already have a shop! Redirecting to your dashboard...",
                redirectUrl: "/dashboard/seller"
            };
        }

        // Database Operations: Upsert User & Create Shop
        await prisma.$transaction(async (tx: any) => {
            const safeEmail = userEmail || `no-email-${userId}@circucity.com`;

            // Check if user already exists by email (e.g. from seed script or desynced Clerk ID)
            const userWithEmail = await tx.user.findUnique({ where: { email: safeEmail } });

            if (userWithEmail && userWithEmail.id !== userId) {
                // If the email exists under a different ID, archive the old email so the new Clerk user can claim it safely
                await tx.user.update({
                    where: { id: userWithEmail.id },
                    data: {
                        email: `${Date.now()}-archived-${userWithEmail.email}`
                    }
                });
            }

            // Safely upsert using the known unique Clerk ID, since the email is now guaranteed to be free
            await tx.user.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: safeEmail,
                    role: 'SELLER',
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
                    image: user.imageUrl || null,
                },
                update: {
                    role: 'SELLER'
                }
            });

            // 2. Create the Shop
            await tx.shop.create({
                data: {
                    name: shopName,
                    description: description,
                    ownerId: userId,
                    sellerType: sellerType || 'PRIVATE',
                    ...(sellerType === 'BUSINESS' && {
                        organizationNumber: organizationNumber
                    })
                }
            });
        });

        // 3. Sync Role to Clerk (for frontend/middleware checks)
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'SELLER'
            }
        });

        revalidatePath("/");

        return { success: true, redirectUrl: "/dashboard/seller" };

    } catch (error) {
        console.error("Failed to register shop:", error);
        return {
            success: false,
            message: "Failed to register shop. Please try again. " + (error instanceof Error ? error.message : "")
        };
    }
}
