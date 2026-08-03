import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subscription } from '@/lib/models/Subscription';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}