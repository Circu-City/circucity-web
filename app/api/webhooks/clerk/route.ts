import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:8',message:'Webhook handler called',data:{hasSecret:!!process.env.CLERK_WEBHOOK_SECRET},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('=== CLERK WEBHOOK RECEIVED ===');

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:14',message:'CLERK_WEBHOOK_SECRET missing',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:40',message:'Webhook signature verified',data:{eventType:evt.type},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('✅ Webhook signature verified');
    } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:43',message:'Webhook verification failed',data:{error:String(err)},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('❌ Error verifying webhook:', err);
        return new NextResponse('Error: Verification failed', { status: 400 });
    }

    console.log('Event type:', evt.type);

    // Handle user.created event
    if (evt.type === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        console.log('Creating user:', {
            id,
            email: email_addresses[0]?.email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim()
        });

        try {
            const user = await prisma.user.create({
                data: {
                    id: id,
                    email: email_addresses[0].email_address,
                    name: `${first_name || ''} ${last_name || ''}`.trim() || null,
                    image: image_url || null,
                },
            });

            console.log('✅ User created successfully:', user.id);

            // Create Stripe Customer
            try {
                const email = email_addresses[0]?.email_address;
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
            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim() || null;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:74',message:'Email address extracted',data:{email:email||null,hasEmail:!!email,emailAddressesCount:email_addresses?.length||0},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.log('Email details:', { email, name });
            
            if (email) {
                try {
                    console.log('Sending welcome email to:', email);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:79',message:'Calling sendWelcomeEmail',data:{to:email,name:name||null},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    await sendWelcomeEmail({ to: email, name });
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:82',message:'Welcome email sent successfully',data:{to:email},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    console.log('✅ Welcome email sent successfully to', email);
                } catch (emailError: any) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:85',message:'Welcome email failed',data:{error:String(emailError?.message||emailError),errorType:emailError?.name||'Unknown'},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    console.error('❌ Welcome email failed:', emailError?.message ?? emailError);
                    console.error('Full error:', JSON.stringify(emailError, null, 2));
                }
            } else {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/eaacdcca-920e-4903-b00a-a759643a2977',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/webhooks/clerk/route.ts:90',message:'No email address found',data:{emailAddresses:email_addresses},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
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
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        console.log('Updating user:', id);

        try {
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    email: email_addresses[0].email_address,
                    name: `${first_name || ''} ${last_name || ''}`.trim() || null,
                    image: image_url || null,
                },
            });

            // Update Stripe Customer name/email
            if (updatedUser.stripeCustomerId) {
                try {
                    await stripe.customers.update(updatedUser.stripeCustomerId, {
                        email: email_addresses[0].email_address,
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
