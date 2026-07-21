import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/lib/models/Product';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}