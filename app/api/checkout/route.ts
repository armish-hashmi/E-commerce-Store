import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { notifyAdmin } from '@/lib/notifications';
import { connectToDatabase } from '@/lib/db';
import { Subscription } from '@/lib/models/Subscription';
import { validateCoupon } from '@/lib/couponValidation';

export async function POST(req: NextRequest) {
  try {
    const authSession = await getSession();

    if (authSession?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin accounts cannot make purchases' },
        { status: 403 }
      );
    }

    const stripe = getStripe();
    const { cartItems, couponCode } = await req.json();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Determine the member discount server-side — never trust a discount value sent from the client.
    let discountPercent = 0;
    if (authSession?.email) {
      await connectToDatabase();
      const sub = await Subscription.findOne({ userEmail: authSession.email.toLowerCase() });
      const isActive =
        !!sub &&
        ['active', 'trialing'].includes(sub.status) &&
        (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date());

      if (isActive) {
        discountPercent = Number(process.env.SUBSCRIPTION_DISCOUNT_PERCENT || 0);
      }
    }

    const toAbsoluteUrl = (url?: string) => {
      if (!url) return undefined;
      if (/^https?:\/\//i.test(url)) return url;
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const itemsTotal = cartItems.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const discountedItemsTotal =
      discountPercent > 0 ? itemsTotal * (1 - discountPercent / 100) : itemsTotal;

    const line_items = cartItems.map((item: any) => {
      const imageUrl = toAbsoluteUrl(item.image);
      const basePrice = item.price || 0;
      const discountedPrice =
        discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name:
              discountPercent > 0 ? `${item.name} (${discountPercent}% member discount)` : item.name,
            images: imageUrl ? [imageUrl] : undefined,
            metadata: { productId: item.id || '' },
          },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    const customerEmail = authSession?.email;

    let stripeDiscounts: { coupon: string }[] | undefined;
    let appliedCouponCode: string | null = null;
    let couponDiscountAmount = 0;

    if (couponCode) {
      await connectToDatabase();
      const result = await validateCoupon(couponCode, discountedItemsTotal);

      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      appliedCouponCode = result.coupon.code;
      couponDiscountAmount = result.discountAmount || 0;

      const stripeCoupon =
        result.coupon.type === 'percentage'
          ? await stripe.coupons.create({ percent_off: result.coupon.value, duration: 'once' })
          : await stripe.coupons.create({
              amount_off: Math.round(couponDiscountAmount * 100),
              currency: 'usd',
              duration: 'once',
            });

      stripeDiscounts = [{ coupon: stripeCoupon.id }];
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      discounts: stripeDiscounts,
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
        discountPercent: String(discountPercent),
        couponCode: appliedCouponCode || '',
        couponDiscountAmount: String(couponDiscountAmount),
      },
    });

    await notifyAdmin({
      title: 'Checkout Started',
      message: `${customerEmail || 'A guest user'} initiated checkout for ${
        cartItems.length
      } item(s) ($${(discountedItemsTotal + 15 - couponDiscountAmount).toFixed(2)}${
        discountPercent > 0 ? `, ${discountPercent}% member discount` : ''
      }${appliedCouponCode ? `, coupon ${appliedCouponCode} applied` : ''})`,
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