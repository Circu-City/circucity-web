
import { NextResponse } from 'next/server';
import { checkRole } from '@/utils/roles';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
    try {
        // 1. Security Check: Only Admins can access this
        const isAdmin = await checkRole('admin');
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // 2. Parse Recipient from query param or default
        const { searchParams } = new URL(request.url);
        const to = searchParams.get('to') || 'support@circucity.com';

        console.log(`[Admin Debug] Triggering production test email to: ${to}`);

        // 3. Send Test Email
        const result = await sendEmail({
            to,
            subject: "CircuCity Production System Test - Verified Domain",
            html: `
                <div style="font-family: sans-serif; padding: 24px; border: 1px solid #2D5F3F; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
                    <div style="background-color: #2D5F3F; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">System Verification Success</h1>
                    </div>
                    <div style="padding: 24px; color: #374151; line-height: 1.6;">
                        <p>Hello Administrator,</p>
                        <p>This email confirms that the CircuCity production email system is <b>fully functional</b> and correctly using your verified domain.</p>
                        
                        <div style="margin: 20px 0; padding: 16px; background-color: #ffffff; border: 1px dashed #d1d5db; border-radius: 8px;">
                            <p style="margin: 0 0 8px 0;"><b>Diagnostics Data:</b></p>
                            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                                <li><b>Environment:</b> Production (cPanel)</li>
                                <li><b>Sender:</b> ${process.env.EMAIL_FROM || 'orders@circucity.com'}</li>
                                <li><b>Protocol:</b> SMTP (local mailcow relay)</li>
                                <li><b>Timestamp:</b> ${new Date().toLocaleString()}</li>
                            </ul>
                        </div>

                        <p>Payments and shipments will now correctly notify customers via this channel.</p>
                    </div>
                    <div style="padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                        CircuCity Sustainability Marketplace
                    </div>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: `Test email sent successfully to ${to}`,
            details: result
        });

    } catch (error: any) {
        console.error('[Admin Debug] Email test failed:', error);
        return NextResponse.json({
            success: false,
            error: error?.message || 'Unknown error occurred during email test',
            details: error
        }, { status: 500 });
    }
}
