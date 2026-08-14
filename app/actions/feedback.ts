'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitSellerFeedback(data: {
    feedbackType: string;
    frictionPoint: string;
    satisfaction: any;
    comment: string;
}) {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.sellerFeedback.create({
            data: {
                userId,
                feedbackType: data.feedbackType,
                frictionPoint: data.frictionPoint,
                satisfaction: data.satisfaction,
                comment: data.comment,
            }
        });

        // Revalidate admin feedback dashboard if needed
        revalidatePath('/dashboard/admin/feedback');
        
        return { success: true };
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        return { success: false, error: "Failed to submit feedback" };
    }
}
