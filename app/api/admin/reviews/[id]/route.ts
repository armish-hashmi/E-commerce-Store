import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Review } from '@/lib/models/Review';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { hidden } = await req.json();

    await connectToDatabase();
    const updated = await Review.findByIdAndUpdate(id, { hidden }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
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

    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete review' }, { status: 500 });
  }
}