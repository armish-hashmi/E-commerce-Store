import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Coupon } from '@/lib/models/Coupon';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch coupons' },
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

    const { code, type, value, expiryDate, usageLimit } = await req.json();

    if (!code || !type || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json({ error: "Type must be 'percentage' or 'fixed'" }, { status: 400 });
    }

    if (type === 'percentage' && (value <= 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (type === 'fixed' && value <= 0) {
      return NextResponse.json({ error: 'Fixed discount amount must be greater than 0' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      type,
      value,
      expiryDate: expiryDate || undefined,
      usageLimit: usageLimit || null,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}