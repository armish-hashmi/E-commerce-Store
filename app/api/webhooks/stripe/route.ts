import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { notifyAdmin } from '@/lib/notifications';
import { getResend } from '@/lib/resend';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      await connectToDatabase();

      const existing = await Order.findOne({ stripeSessionId: fullSession.id });
      if (!existing) {
        const orderItems = (fullSession.line_items?.data || []).map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: (item.amount_total || 0) / 100,
        }));

        const newOrder = await Order.create({
          stripeSessionId: fullSession.id,
          paymentIntentId:
            typeof fullSession.payment_intent === 'string'
              ? fullSession.payment_intent
              : fullSession.payment_intent?.id,
          customerEmail: fullSession.customer_details?.email || '',
          amountTotal: (fullSession.amount_total || 0) / 100,
          currency: fullSession.currency,
          status: 'paid',
          items: orderItems,
        });

        await notifyAdmin({
          title: 'New Order',
          message: `New order from ${newOrder.customerEmail || 'a customer'} — $${newOrder.amountTotal.toFixed(2)}`,
          orderId: newOrder._id.toString(),
        });

        if (newOrder.customerEmail) {
          try {
            const resend = getResend();
            await resend.emails.send({
              from: 'Online Store <onboarding@resend.dev>',
              to: newOrder.customerEmail,
              subject: 'Order Confirmation',
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2>Thank you for your order!</h2>
                  <p>We've received your order and it's being processed.</p>
                  <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                    <tbody>
                      ${orderItems
                        .map(
                          (item) => `
                        <tr>
                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                            ${item.name} <span style="color:#9ca3af;">x${item.quantity}</span>
                          </td>
                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                            $${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                  <p style="font-size: 16px; font-weight: 700; text-align: right;">
                    Total: $${newOrder.amountTotal.toFixed(2)}
                  </p>
                  <p style="color:#6b7280; font-size: 13px; margin-top: 24px;">
                    Order reference: ${newOrder._id.toString()}
                  </p>
                </div>
              `,
            });
          } catch (emailErr) {
            console.error('Failed to send order confirmation email:', emailErr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save order from Stripe webhook:', err);
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}