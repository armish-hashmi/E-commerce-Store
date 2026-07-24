import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email || null,
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency,
      items: (session.line_items?.data || []).map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amount: (item.amount_total || 0) / 100,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}