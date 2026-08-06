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
    const { status, reason } = await req.json();

    if (!['accepted', 'rejected', 'delivered'].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted', 'delivered', or 'rejected'" },
        { status: 400 }
      );
    }

    if (status === 'rejected' && (!reason || !reason.trim())) {
      return NextResponse.json(
        { error: 'A reason is required when rejecting an order' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === 'rejected' ? { statusReason: reason.trim() } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (updated.customerEmail) {
      let title = '';
      let message = '';

      if (status === 'rejected') {
        title = 'Order Rejected';
        message = `Your order has been rejected. Reason: ${reason.trim()} Since payment was already captured, a full refund of $${updated.amountTotal.toFixed(
          2
        )} will be issued automatically to your original payment method within 5–10 business days.`;
      } else if (status === 'accepted') {
        title = 'Order Accepted';
        message = 'Good news — your order has been accepted and is now being prepared for shipment.';
      } else if (status === 'delivered') {
        title = 'Order Delivered';
        message = 'Your order has been marked as delivered. We hope you love it — feel free to leave a review!';
      }

      await notifyUser(updated.customerEmail, {
        title,
        message,
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