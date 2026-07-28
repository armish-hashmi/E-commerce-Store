import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { notifyAdmin } from '@/lib/notifications';

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

    const itemsTotal = cartItems.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

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

    const authSession = await getSession();
    const customerEmail = authSession?.email;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
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
      metadata: {
        userEmail: customerEmail || 'guest',
        itemCount: String(cartItems.length),
      },
    });

    await notifyAdmin({
      title: 'Checkout Started',
      message: `${customerEmail || 'A guest user'} initiated checkout for ${
        cartItems.length
      } item(s) ($${(itemsTotal + 15).toFixed(2)})`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}