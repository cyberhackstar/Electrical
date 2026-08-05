export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface CouponResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
}

export interface CouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit?: number;
}

export interface CouponValidationResponse {
  code: string;
  discountAmount: number;
  payableAmount: number;
}
