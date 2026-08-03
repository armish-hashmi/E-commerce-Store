import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Subscription } from '@/lib/models/Subscription';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const sub = await Subscription.findOne({ userEmail: session.email.toLowerCase() });

    if (!sub || !sub.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const stripe = getStripe();
    const updatedStripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    sub.cancelAtPeriodEnd = true;
    sub.status = updatedStripeSub.status;
    await sub.save();

    return NextResponse.json({
      message: 'Your subscription will end at the close of the current billing period.',
      currentPeriodEnd: sub.currentPeriodEnd,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}