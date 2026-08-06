import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateCoupon } from '@/lib/couponValidation';

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || typeof cartTotal !== 'number') {
      return NextResponse.json({ error: 'code and cartTotal are required' }, { status: 400 });
    }

    await connectToDatabase();
    const result = await validateCoupon(code, cartTotal);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      type: result.coupon.type,
      value: result.coupon.value,
      discountAmount: result.discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}