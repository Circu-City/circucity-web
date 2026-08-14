import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET: Retrieve shop settings (including PostNord customer number)
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const shop = await prisma.shop.findUnique({
            where: { ownerId: userId },
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                coverImage: true,
                sellerType: true,
                organizationNumber: true,
                postnordCustomerNumber: true,
                bankName: true,
                accountHolder: true,
                clearingNumber: true,
                accountNumber: true,
                swiftIban: true,
            }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        return NextResponse.json(shop);
    } catch (error) {
        console.error('Error fetching shop settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update shop settings
export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, logo, coverImage, sellerType, organizationNumber, postnordCustomerNumber, bankName, accountHolder, clearingNumber, accountNumber, swiftIban } = body;

        const existingShop = await prisma.shop.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!existingShop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (logo !== undefined) data.logo = logo;
        if (coverImage !== undefined) data.coverImage = coverImage;
        if (sellerType !== undefined) data.sellerType = sellerType;
        if (organizationNumber !== undefined) data.organizationNumber = organizationNumber;
        if (postnordCustomerNumber !== undefined) data.postnordCustomerNumber = postnordCustomerNumber;
        if (bankName !== undefined) data.bankName = bankName;
        if (accountHolder !== undefined) data.accountHolder = accountHolder;
        if (clearingNumber !== undefined) data.clearingNumber = clearingNumber;
        if (accountNumber !== undefined) data.accountNumber = accountNumber;
        if (swiftIban !== undefined) data.swiftIban = swiftIban;

        const updatedShop = await prisma.shop.update({
            where: { ownerId: userId },
            data,
        });

        return NextResponse.json(updatedShop);
    } catch (error) {
        console.error('Error updating shop settings:', error);
        return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
    }
}
