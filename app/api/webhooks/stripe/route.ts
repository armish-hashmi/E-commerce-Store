import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { Subscription } from '@/lib/models/Subscription';
import { SubscriptionEvent } from '@/lib/models/SubscriptionEvent';
import { Coupon } from '@/lib/models/Coupon';
import { notifyAdmin, notifyUser } from '@/lib/notifications';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date | undefined {
  const topLevel = (subscription as any).current_period_end;
  if (typeof topLevel === 'number') {
    return new Date(topLevel * 1000);
  }

  const itemLevel = (subscription as any).items?.data?.[0]?.current_period_end;
  if (typeof itemLevel === 'number') {
    return new Date(itemLevel * 1000);
  }

  return undefined;
}

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

    if (session.mode === 'subscription') {
      try {
        await connectToDatabase();

        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const email = session.customer_details?.email || session.metadata?.userEmail || '';

        if (customerId && subscriptionId && email) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

          await Subscription.findOneAndUpdate(
            { userEmail: email.toLowerCase() },
            {
              userEmail: email.toLowerCase(),
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: stripeSubscription.status,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
              currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
            },
            { upsert: true, new: true }
          );

          await SubscriptionEvent.create({
            userEmail: email.toLowerCase(),
            stripeSubscriptionId: subscriptionId,
            eventType: 'created',
            status: stripeSubscription.status,
            currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
          });

          await notifyUser(email, {
            title: 'Subscription Active',
            message: 'Your subscription is now active — enjoy your member discount!',
          });
        }
      } catch (err) {
        console.error('Failed to save subscription from Stripe webhook:', err);
        return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    try {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      await connectToDatabase();

      const existing = await Order.findOne({ stripeSessionId: fullSession.id });
      if (!existing) {
        const couponCode = fullSession.metadata?.couponCode || undefined;
        const couponDiscountAmount = fullSession.metadata?.couponDiscountAmount
          ? Number(fullSession.metadata.couponDiscountAmount)
          : undefined;

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
          couponCode: couponCode || undefined,
          couponDiscountAmount: couponDiscountAmount || undefined,
          items: (fullSession.line_items?.data || []).map((item) => ({
            name: item.description,
            quantity: item.quantity,
            amount: (item.amount_total || 0) / 100,
          })),
        });

        if (couponCode) {
          await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
        }

        await notifyAdmin({
          title: 'New Order',
          message: `New order from ${newOrder.customerEmail || 'a customer'} — $${newOrder.amountTotal.toFixed(2)}`,
          orderId: newOrder._id.toString(),
        });
      }
    } catch (err) {
      console.error('Failed to save order from Stripe webhook:', err);
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    try {
      await connectToDatabase();

      const updated = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSubscription.id },
        {
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
          currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
        },
        { new: true }
      );

      if (updated) {
        await SubscriptionEvent.create({
          userEmail: updated.userEmail,
          stripeSubscriptionId: stripeSubscription.id,
          eventType: event.type === 'customer.subscription.deleted' ? 'canceled' : 'updated',
          status: stripeSubscription.status,
          currentPeriodEnd: getCurrentPeriodEnd(stripeSubscription),
        });

        if (event.type === 'customer.subscription.deleted' || stripeSubscription.status === 'canceled') {
          await notifyUser(updated.userEmail, {
            title: 'Subscription Canceled',
            message: 'Your subscription has ended. You can resubscribe anytime.',
          });
        }
      }
    } catch (err) {
      console.error('Failed to update subscription from Stripe webhook:', err);
      return NextResponse.json({ error: 'Failed to process subscription update' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}