import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SubscriptionEvent } from '@/lib/models/SubscriptionEvent';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const events = await SubscriptionEvent.find({ userEmail: session.email.toLowerCase() }).sort({
      createdAt: -1,
    });

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch subscription history' },
      { status: 500 }
    );
  }
}