import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (user?.role === 'ADMIN') {
        redirect("/dashboard/admin");
    }

    if (user?.role === 'SELLER') {
        const shop = await prisma.shop.findUnique({
            where: { ownerId: userId },
        });
        if (shop) redirect("/dashboard/seller");
    }

    const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
    });
    if (shop) redirect("/dashboard/seller");

    redirect("/dashboard/buyer");
}
