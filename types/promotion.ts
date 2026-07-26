export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type CustomerEligibility = "all" | "authenticated" | "guest";

export type Coupon = {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderMmk: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  enabled: boolean;
  customerEligibility: CustomerEligibility;
  createdAt: string;
  updatedAt: string;
};

export type PublicPromotion = {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderMmk: number;
  expiresAt: string | null;
};

export type Discount = {
  couponId: string;
  code: string;
  discountType: DiscountType;
  discountMmk: number;
  freeShipping: boolean;
};

export type PromotionRule = {
  minimumOrderMmk: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  enabled: boolean;
  customerEligibility: CustomerEligibility;
};

export type OrderSummary = {
  subtotalMmk: number;
  discountMmk: number;
  shippingMmk: number;
  taxMmk: number;
  totalMmk: number;
  coupon: Discount | null;
};
