import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Subscription } from '@/lib/models/Subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();
    const sub = await Subscription.findById(id);

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const stripe = getStripe();
    const updatedStripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    sub.cancelAtPeriodEnd = true;
    sub.status = updatedStripeSub.status;
    await sub.save();

    return NextResponse.json(sub);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}