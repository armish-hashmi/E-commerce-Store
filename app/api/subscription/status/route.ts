import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subscription } from '@/lib/models/Subscription';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ isSubscribed: false });
    }

    await connectToDatabase();
    const sub = await Subscription.findOne({ userEmail: session.email.toLowerCase() });

    const isSubscribed =
      !!sub && ['active', 'trialing'].includes(sub.status) &&
      (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date());

    return NextResponse.json({
      isSubscribed,
      status: sub?.status || null,
      currentPeriodEnd: sub?.currentPeriodEnd || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}