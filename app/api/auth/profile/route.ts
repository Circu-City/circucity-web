import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, phone, address, city, country, language, currency, notifications, newsletter, businessType, vatNumber } = body;

    // Update user in DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        billingName: name ?? undefined,
        billingAddress: address ?? undefined,
        billingCity: city ?? undefined,
        billingCountry: country ?? undefined,
        businessType: businessType ?? undefined,
        vatNumber: vatNumber ?? undefined,
      },
    });

    // Update or create Stripe Customer with tax data
    try {
      const customerData: any = {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: {
          line1: address ?? undefined,
          city: city ?? undefined,
          country: country ?? undefined,
        },
      };

      // If business with EU VAT, set tax ID
      if (businessType === 'business' && vatNumber && country && country !== 'NO') {
        customerData.tax_id_data = [
          {
            type: 'eu_vat',
            value: vatNumber,
          },
        ];
      }

      if (user.stripeCustomerId) {
        await stripe.customers.update(user.stripeCustomerId, customerData);
      } else {
        const customer = await stripe.customers.create({
          ...customerData,
          metadata: { clerkUserId: userId },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
      }
    } catch (stripeError: any) {
      console.error("Failed to update Stripe Customer:", stripeError);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
