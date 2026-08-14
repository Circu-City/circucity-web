
import * as dotenv from 'dotenv';
import path from 'path';
import { sendEmail } from '../lib/email';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
    console.log("--- CircuCity Email Test ---");
    
    // 1. Check Configuration
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    
    console.log(`Configured Sender: ${fromEmail || 'onboarding@resend.dev (Restricted)'}`);
    console.log(`API Key Status: ${apiKey ? 'Loaded ✅' : 'NOT FOUND ❌'}`);

    if (!apiKey) {
        console.error("Error: RESEND_API_KEY is missing in .env.local");
        process.exit(1);
    }

    // 2. Identify Recipient
    const recipient = process.argv[2] || "circucity2024@gmail.com";
    console.log(`Target Recipient: ${recipient}`);

    // 3. Send Test
    try {
        console.log("\nSending test email...");
        const result = await sendEmail({
            to: recipient,
            subject: "CircuCity Manual Email System Test",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #2D5F3F;">Success!</h1>
                    <p>This is a manual test email triggered from the CircuCity CLI.</p>
                    <p><b>Sender:</b> ${fromEmail || 'onboarding@resend.dev'}</p>
                    <p><b>Recipient:</b> ${recipient}</p>
                    <p><b>Status:</b> Fully Functional ✅</p>
                    <hr/>
                    <p style="font-size: 12px; color: #888;">CircuCity Sustainability Marketplace</p>
                </div>
            `
        });
        
        console.log("\n✅ Success! Resend accepted the email.");
        console.log("Details:", JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("\n❌ Error: Failed to send email.");
        console.error("Message:", error?.message || error);
    }
}

testEmail();
