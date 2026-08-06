import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}