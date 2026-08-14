import { Resend } from 'resend';

const getResendClient = () => {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
};

const getFromEmail = () => {
  return process.env.EMAIL_FROM ?? 'CircuCity <noreply@circucity.com>';
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a single email via Resend.
 * No-ops if RESEND_API_KEY is not set (e.g. local dev).
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const resend = getResendClient();
  const FROM = getFromEmail();

  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Skipping send (no RESEND_API_KEY):', { to, subject });
    } else {
      console.warn('[Email] Skipping send (no RESEND_API_KEY is set in environment):', { to, subject });
    }
    return { success: true };
  }

  // Warn if using the default onboarding address in production
  if (FROM.includes('onboarding@resend.dev') && process.env.NODE_ENV === 'production') {
    console.warn('[Email] ⚠️ WARNING: Using onboarding@resend.dev in production. Emails will ONLY be sent to the Resend account owner. Please verify your domain and set EMAIL_FROM.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Email] ❌ Send failed:', {
        to,
        subject,
        error: error.message || error,
        details: error
      });
      throw error;
    }

    console.log('[Email] ✅ Email sent successfully:', {
      to,
      subject,
      id: data?.id
    });
    return { success: true };
  } catch (catchErr: any) {
    console.error('[Email] ❌ Unexpected error during send:', catchErr?.message || catchErr);
    throw catchErr;
  }
}

/**
 * Welcome email sent after first sign-up (triggered by Clerk user.created webhook).
 */
export async function sendWelcomeEmail(params: { to: string; name?: string | null }) {
  const { to, name } = params;
  const displayName = name?.trim() || 'there';
  const subject = 'Welcome to CircuCity – Your Sustainable Shopping Journey Starts Here';
  const html = getWelcomeEmailHtml(displayName);
  return sendEmail({ to, subject, html });
}

function getWelcomeEmailHtml(name: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
  const productsUrl = `${baseUrl}/products`;
  const primaryColor = '#2D5F3F';
  const accentColor = '#F4D35E';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CircuCity</title>
</head>
<body style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: ${primaryColor}; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Welcome to CircuCity</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Your destination for sustainable living</p>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333;">Thanks for joining CircuCity. We're glad to have you.</p>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333;">Shop organic, recycled, and eco-friendly products and reduce your carbon footprint with every purchase.</p>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333;">Ready to explore?</p>
      <a href="${productsUrl}" style="display: inline-block; background: ${accentColor}; color: ${primaryColor}; font-weight: 600; font-size: 16px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">Browse products</a>
      <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.5; color: #666;">If you have any questions, reply to this email or contact us at support@circucity.com.</p>
    </div>
    <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 12px; color: #888;">CircuCity – Sustainable Living Marketplace</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface ThankYouEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SendThankYouEmailParams {
  to: string;
  name?: string | null;
  orderId: string;
  orderShortId: string;
  items: ThankYouEmailItem[];
  total: number;
  shippingAddress: string;
}

/**
 * Thank you / order confirmation email sent after successful checkout (Stripe webhook).
 */
export async function sendThankYouEmail(params: SendThankYouEmailParams) {
  const { to, name, orderId, orderShortId, items, total, shippingAddress } = params;
  const displayName = name?.trim() || 'Customer';
  const subject = `Thank you for your order #${orderShortId} – CircuCity`;
  const html = getThankYouEmailHtml({
    name: displayName,
    orderShortId,
    orderId,
    items,
    total,
    shippingAddress,
  });
  return sendEmail({ to, subject, html });
}

function getThankYouEmailHtml(params: {
  name: string;
  orderShortId: string;
  orderId: string;
  items: ThankYouEmailItem[];
  total: number;
  shippingAddress: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
  const orderUrl = `${baseUrl}/dashboard/orders/${params.orderId}`;
  const primaryColor = '#2D5F3F';
  const accentColor = '#F4D35E';
  const formatPrice = (n: number) => {
    return `${n.toFixed(2)} kr`;
  };

  const rows = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${escapeHtml(item.name)}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: right;">${formatPrice(item.price)}</td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation – CircuCity</title>
</head>
<body style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: ${primaryColor}; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Thank you for your order</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Order #${escapeHtml(params.orderShortId)}</p>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333;">Hi ${escapeHtml(params.name)},</p>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333;">Your order has been placed successfully. Here are the details.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee;">Item</th>
            <th style="padding: 10px 8px; text-align: center; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee;">Qty</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #333;">Total: ${formatPrice(params.total)}</p>
      <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
        <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #666;">Shipping address</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #333; white-space: pre-line;">${escapeHtml(params.shippingAddress)}</p>
      </div>
      <p style="margin: 24px 0 0;">
        <a href="${orderUrl}" style="display: inline-block; background: ${accentColor}; color: ${primaryColor}; font-weight: 600; font-size: 16px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">View order</a>
      </p>
      <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.5; color: #666;">Questions? Contact us at circucity2024@gmail.com.</p>
    </div>
    <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 12px; color: #888;">CircuCity – Sustainable Living Marketplace</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendShipmentNotificationEmail(params: { to: string; name?: string | null; trackingNumber: string; orderShortId: string }) {
  const { to, name, trackingNumber, orderShortId } = params;
  const displayName = name?.trim() || 'Customer';
  const subject = `Your order #${orderShortId} has shipped! – CircuCity`;
  const trackingUrl = `https://www.postnord.se/en/our-tools/track-and-trace?shipmentId=${trackingNumber}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; font-family: sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
    <div style="background: #2D5F3F; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Good news, your order is on the way!</h1>
    </div>
    <div style="padding: 32px;">
      <p>Hi ${escapeHtml(displayName)},</p>
      <p>Your order #${escapeHtml(orderShortId)} has been shipped via PostNord.</p>
      <p>Tracking Number: <strong>${escapeHtml(trackingNumber)}</strong></p>
      <a href="${trackingUrl}" style="display: inline-block; background: #F4D35E; color: #2D5F3F; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Track Shipment</a>
    </div>
  </div>
</body>
</html>`;
  return sendEmail({ to, subject, html });
}

export async function sendNewSaleAlertEmail(params: { to: string; shopName: string; orderShortId: string; products: string[] }) {
  const { to, shopName, orderShortId, products } = params;
  const subject = `Cha-ching! New order #${orderShortId} – CircuCity`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; font-family: sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
    <div style="background: #2D5F3F; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">You made a sale!</h1>
    </div>
    <div style="padding: 32px;">
      <p>Hi ${escapeHtml(shopName)},</p>
      <p>Congratulations! You just received a new order (#${escapeHtml(orderShortId)}).</p>
      <p><strong>Items ordered:</strong><br/>${escapeHtml(products.join(', '))}</p>
      <p>Please log in to your Seller Dashboard to fulfill this order and print the shipping label.</p>
      <a href="${process.env.NEXT_PUBLIC_URL || 'https://circucity.com'}/dashboard/seller/orders" style="display: inline-block; background: #F4D35E; color: #2D5F3F; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>`;
  return sendEmail({ to, subject, html });
}

export async function sendRefundReceiptEmail(params: { to: string; name?: string | null; orderShortId: string; amount: number }) {
  const { to, name, orderShortId, amount } = params;
  const displayName = name?.trim() || 'Customer';
  const subject = `Refund processed for order #${orderShortId} – CircuCity`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; font-family: sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
    <div style="background: #2D5F3F; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Refund Processed</h1>
    </div>
    <div style="padding: 32px;">
      <p>Hi ${escapeHtml(displayName)},</p>
      <p>We have successfully processed a refund for your order #${escapeHtml(orderShortId)}.</p>
      <p><strong>Refund Amount:</strong> ${amount.toFixed(2)} kr</p>
      <p>Please note that it may take 5-10 business days for the funds to appear in your bank account depending on your financial institution.</p>
    </div>
  </div>
</body>
</html>`;
  return sendEmail({ to, subject, html });
}

export async function sendEcoMilestoneEmail(params: { to: string; name?: string | null; ecoPoints: number }) {
  const { to, name, ecoPoints } = params;
  const displayName = name?.trim() || 'Eco-Warrior';
  const subject = `🎉 Congratulations! You reached ${ecoPoints} Eco-Tokens!`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; font-family: sans-serif; background-color: #f5f5f5; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
    <div style="background: #2D5F3F; color: #fff; padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Sustainability Milestone!</h1>
    </div>
    <div style="padding: 32px;">
      <p>Awesome work, ${escapeHtml(displayName)}!</p>
      <p>You have officially collected <strong>${ecoPoints} Eco-Tokens</strong>.</p>
      <p>Check out your ranking on the Global Leaderboard and continue shopping sustainably to climb higher!</p>
      <a href="${process.env.NEXT_PUBLIC_URL || 'https://circucity.com'}/leaderboard" style="display: inline-block; background: #F4D35E; color: #2D5F3F; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 16px;">View Leaderboard</a>
    </div>
  </div>
</body>
</html>`;
  return sendEmail({ to, subject, html });
}
