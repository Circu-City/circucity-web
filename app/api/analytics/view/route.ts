import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Get optional user ID if logged in
        const { userId } = await auth();

        // Check if product exists and get shopId
        // This validates the product ID and ensures data integrity
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Create the view record
        await prisma.productView.create({
            data: {
                productId: product.id,
                shopId: product.shopId,
                // Optional: Store userId if authenticated? Schema doesn't have it yet?
                // Wait, schema in Step 435 didn't include userId, only productId and shopId
                // So we skip storing userId for now based on schema
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording view:', error);
        return NextResponse.json(
            { error: 'Failed to record view' },
            { status: 500 }
        );
    }
}
