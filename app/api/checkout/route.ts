import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { cartItems } = await req.json();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    const toAbsoluteUrl = (url?: string) => {
      if (!url) return undefined;
      if (/^https?:\/\//i.test(url)) return url;
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const line_items = cartItems.map((item: any) => {
      const imageUrl = toAbsoluteUrl(item.image);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: Math.round((item.price || 0) * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' }, 
            display_name: 'Standard Shipping',
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}