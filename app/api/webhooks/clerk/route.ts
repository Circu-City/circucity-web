import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendWelcomeEmail } from '@/lib/email';
import { syncClerkUser } from '@/lib/sync-clerk-user';

export async function POST(req: Request) {
    console.log('=== CLERK WEBHOOK RECEIVED ===');

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('❌ CLERK_WEBHOOK_SECRET is not defined');
        throw new Error('Please add CLERK_WEBHOOK_SECRET to .env or .env.local');
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('❌ Missing svix headers');
        return new NextResponse('Error: Missing svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
        console.log('✅ Webhook signature verified');
    } catch (err) {
        console.error('❌ Error verifying webhook:', err);
        return new NextResponse('Error: Verification failed', { status: 400 });
    }

    console.log('Event type:', evt.type);

    // Handle user.created event
    if (evt.type === 'user.created') {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses.find((address) => address.id === primary_email_address_id)?.email_address
            || email_addresses[0]?.email_address;

        if (!primaryEmail) {
            console.error('❌ Cannot create user: no email address in Clerk event');
            return new NextResponse('Error: Missing email address', { status: 400 });
        }

        console.log('Creating user:', {
            id,
            email: primaryEmail,
            name: `${first_name || ''} ${last_name || ''}`.trim()
        });

        try {
            const { user, created } = await syncClerkUser({
                id,
                email: primaryEmail,
                name: `${first_name || ''} ${last_name || ''}`.trim() || null,
                image: image_url || null,
            });

            console.log('✅ User created successfully:', user.id);

            // Create Stripe Customer
            if (created) try {
                const email = primaryEmail;
                const name = `${first_name || ''} ${last_name || ''}`.trim() || null;
                const customer = await stripe.customers.create({
                    email: email,
                    name: name,
                    metadata: { clerkUserId: id },
                });
                await prisma.user.update({
                    where: { id: user.id },
                    data: { stripeCustomerId: customer.id },
                });
                console.log('✅ Stripe Customer created:', customer.id);
            } catch (stripeError) {
                console.error('❌ Failed to create Stripe Customer:', stripeError);
            }

            // Send welcome email (don't fail webhook if email fails)
            console.log('\n=== ATTEMPTING TO SEND WELCOME EMAIL ===');
            const email = primaryEmail;
            const name = `${first_name || ''} ${last_name || ''}`.trim() || null;
            console.log('Email details:', { email, name });
            
            if (created && email) {
                try {
                    console.log('Sending welcome email to:', email);
                    await sendWelcomeEmail({ to: email, name });
                    console.log('✅ Welcome email sent successfully to', email);
                } catch (emailError: any) {
                    console.error('❌ Welcome email failed:', emailError?.message ?? emailError);
                    console.error('Full error:', JSON.stringify(emailError, null, 2));
                }
            } else if (created) {
                console.error('❌ Cannot send welcome email: No email address found');
                console.error('Email addresses:', email_addresses);
            }
        } catch (error: any) {
            console.error('❌ Error creating user:', error.message);

            // If user already exists, that's okay
            if (error.code === 'P2002') {
                console.log('ℹ️  User already exists, skipping');
                return new NextResponse('User already exists', { status: 200 });
            }

            return new NextResponse('Error creating user', { status: 500 });
        }
    }

    // Handle user.updated event
    if (evt.type === 'user.updated') {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses.find((address) => address.id === primary_email_address_id)?.email_address
            || email_addresses[0]?.email_address;

        if (!primaryEmail) {
            console.error('❌ Cannot update user: no email address in Clerk event');
            return new NextResponse('Error: Missing email address', { status: 400 });
        }

        console.log('Updating user:', id);

        try {
            const { user: updatedUser } = await syncClerkUser({
                id,
                email: primaryEmail,
                name: `${first_name || ''} ${last_name || ''}`.trim() || null,
                image: image_url || null,
            });

            // Update Stripe Customer name/email
            if (updatedUser.stripeCustomerId) {
                try {
                    await stripe.customers.update(updatedUser.stripeCustomerId, {
                        email: primaryEmail,
                        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
                    });
                    console.log('✅ Stripe Customer updated');
                } catch (stripeError) {
                    console.error('❌ Failed to update Stripe Customer:', stripeError);
                }
            }

            console.log('✅ User updated successfully');
        } catch (error: any) {
            console.error('❌ Error updating user:', error.message);
            return new NextResponse('Error updating user', { status: 500 });
        }
    }

    // Handle user.deleted event
    if (evt.type === 'user.deleted') {
        const { id } = evt.data;

        console.log('Deleting user:', id);

        try {
            await prisma.user.delete({
                where: { id: id as string },
            });

            console.log('✅ User deleted successfully');
        } catch (error: any) {
            console.error('❌ Error deleting user:', error.message);
            return new NextResponse('Error deleting user', { status: 500 });
        }
    }

    return new NextResponse('', { status: 200 });
}
