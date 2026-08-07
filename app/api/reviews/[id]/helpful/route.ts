import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to vote' }, { status: 401 });
    }

    const { reviewId } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.findById(reviewId);
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