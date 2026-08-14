import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRole } from "@/utils/roles";

export async function GET() {
    try {
        const isAdmin = await checkRole('admin');
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
        }

        const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
        if (!CLERK_SECRET_KEY) {
            return NextResponse.json({ error: "CLERK_SECRET_KEY not configured" }, { status: 500 });
        }

        const allUsers: any[] = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
            const res = await fetch(
                `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`,
                { headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` } }
            );
            if (!res.ok) break;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                hasMore = false;
            } else {
                allUsers.push(...data);
                offset += limit;
                if (data.length < limit) hasMore = false;
            }
        }

        let created = 0;
        let skipped = 0;

        for (const user of allUsers) {
            const email = user.email_addresses?.[0]?.email_address;
            if (!email) { skipped++; continue; }

            const existing = await prisma.user.findUnique({ where: { id: user.id } });
            if (existing) { skipped++; continue; }

            try {
                const existingEmail = await prisma.user.findUnique({ where: { email } });
                if (existingEmail) {
                    await prisma.user.update({ where: { email }, data: { id: user.id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null, image: user.image_url || null } });
                    skipped++;
                    continue;
                }
            } catch (_) {}

            await prisma.user.create({
                data: {
                    id: user.id,
                    email,
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
                    image: user.image_url || null,
                },
            });
            created++;
        }

        return NextResponse.json({
            success: true,
            total: allUsers.length,
            created,
            skipped,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
