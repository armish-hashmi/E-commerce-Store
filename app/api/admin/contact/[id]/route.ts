import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Order } from '@/lib/models/Order'; 

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

     const order = await Order.findById(id);
    if (!order) {
       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
     }

    return NextResponse.json({ message: `Fetch order ${id}` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    await connectToDatabase();

   const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });
    
    return NextResponse.json({ message: `Updated order ${id}` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}