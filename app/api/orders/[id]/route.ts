import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { getSession } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';

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
    const { status } = await req.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

  if (updated.customerEmail) {
  await notifyUser(updated.customerEmail, {
    title: 'Order Status Updated',
    message: `Your order has been ${status}.`,
    orderId: updated._id.toString(),
  });
}

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}