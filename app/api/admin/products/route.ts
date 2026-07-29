import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, price } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Product.findOne({
      $or: [{ name: name.trim() }, { price }],
    });

    if (existing) {
      const isDuplicateName = existing.name === name.trim();
      return NextResponse.json(
        {
          error: isDuplicateName
            ? 'A product with this name already exists'
            : 'A product with this price already exists',
        },
        { status: 409 }
      );
    }

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create product' }, { status: 500 });
  }
}