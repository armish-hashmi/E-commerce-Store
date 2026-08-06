import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { getSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to vote' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    if (review.helpfulVoters.includes(session.email)) {
      return NextResponse.json({ error: 'You already marked this as helpful' }, { status: 400 });
    }

    review.helpfulVoters.push(session.email);
    review.helpfulCount = review.helpfulVoters.length;
    await review.save();

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update review' }, { status: 500 });
  }
}