import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Coupon } from '@/lib/models/Coupon';
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
    const body = await req.json();

    const allowedFields = ['type', 'value', 'expiryDate', 'usageLimit', 'isActive'];
    const update: any = {};
    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }

    await connectToDatabase();
    const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update coupon' },
      { status: 500 }
    );
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
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}