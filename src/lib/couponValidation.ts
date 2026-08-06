import { Coupon } from '@/lib/models/Coupon';

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: any;
  discountAmount?: number;
}

export async function validateCoupon(code: string, cartTotal: number): Promise<CouponValidationResult> {
  if (!code) {
    return { valid: false, error: 'No coupon code provided' };
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'This coupon is no longer active' };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, error: 'This coupon has expired' };
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = cartTotal * (coupon.value / 100);
  } else {
    discountAmount = Math.min(coupon.value, cartTotal); // never discount below $0
  }

  return { valid: true, coupon, discountAmount };
}