import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models/Order';

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
        await Order.create({
          stripeSessionId: fullSession.id,
          customerEmail: fullSession.customer_details?.email || '',
          amountTotal: (fullSession.amount_total || 0) / 100,
          currency: fullSession.currency,
          status: 'paid',
          items: (fullSession.line_items?.data || []).map((item) => ({
            name: item.description,
            quantity: item.quantity,
            amount: (item.amount_total || 0) / 100,
          })),
        });
      }
    } catch (err) {
      console.error('Failed to save order from Stripe webhook:', err);
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}