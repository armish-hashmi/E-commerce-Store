import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { getSession } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    if (review.userEmail.toLowerCase() !== session.email?.toLowerCase() && session.role !== 'admin') {
      return NextResponse.json({ error: 'You can only delete your own review' }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete review' }, { status: 500 });
  }
}