import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authSession = await getSession();
    if (!authSession) {
      return NextResponse.json({ error: 'You must be logged in to subscribe' }, { status: 401 });
    }

    if (authSession.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin accounts cannot subscribe' },
        { status: 403 }
      );
    }

    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: 'Subscription price is not configured' }, { status: 500 });
    }

    const stripe = getStripe();
    const origin = req.nextUrl.origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: authSession.email,
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      metadata: {
        userEmail: authSession.email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start subscription checkout' },
      { status: 500 }
    );
  }
}