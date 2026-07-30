import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { getSession } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';

export async function POST(
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
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'refunded') {
      return NextResponse.json({ error: 'Order has already been refunded' }, { status: 400 });
    }

    if (!order.paymentIntentId) {
      return NextResponse.json(
        { error: 'This order has no associated payment to refund (created before refund support was added)' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    await stripe.refunds.create({ payment_intent: order.paymentIntentId });

    order.status = 'refunded';
    await order.save();

    if (order.customerEmail) {
      await notifyUser(order.customerEmail, {
        title: 'Order Refunded',
        message: `Your order has been refunded.`,
        orderId: order._id.toString(),
      });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}