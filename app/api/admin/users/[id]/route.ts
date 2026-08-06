import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Order } from '@/lib/models/Order';
import { getSession } from '@/lib/auth';

export async function GET(
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
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await Order.find({ customerEmail: user.email.toLowerCase() }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ user, orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}


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
    const { isDisabled } = await req.json();

    if (typeof isDisabled !== 'boolean') {
      return NextResponse.json({ error: 'isDisabled must be a boolean' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be disabled from here' },
        { status: 400 }
      );
    }

    user.isDisabled = isDisabled;
    await user.save();

    const { password, ...safeUser } = user.toObject();
    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}