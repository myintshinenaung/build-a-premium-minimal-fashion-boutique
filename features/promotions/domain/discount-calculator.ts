import type { Coupon, Discount, OrderSummary } from "@/types/promotion";

export function calculateDiscountAmount(coupon: Pick<Coupon, "discountType" | "discountValue">, subtotalMmk: number) {
  if (coupon.discountType === "percentage") {
    return Math.min(Math.floor((subtotalMmk * coupon.discountValue) / 100), subtotalMmk);
  }

  if (coupon.discountType === "fixed") {
    return Math.min(coupon.discountValue, subtotalMmk);
  }

  return 0;
}

export function calculateDiscount(
  coupon: Coupon,
  subtotalMmk: number,
  shippingMmk: number,
  taxMmk = 0
): OrderSummary {
  const freeShipping = coupon.discountType === "free_shipping";
  const discountMmk = calculateDiscountAmount(coupon, subtotalMmk);
  const adjustedShippingMmk = freeShipping ? 0 : shippingMmk;
  const totalMmk = Math.max(subtotalMmk - discountMmk + adjustedShippingMmk + taxMmk, 0);

  const appliedDiscount: Discount = {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountMmk,
    freeShipping
  };

  return {
    subtotalMmk,
    discountMmk,
    shippingMmk: adjustedShippingMmk,
    taxMmk,
    totalMmk,
    coupon: appliedDiscount
  };
}

export function buildEmptyOrderSummary(subtotalMmk: number, shippingMmk: number, taxMmk = 0): OrderSummary {
  return {
    subtotalMmk,
    discountMmk: 0,
    shippingMmk,
    taxMmk,
    totalMmk: subtotalMmk + shippingMmk + taxMmk,
    coupon: null
  };
}
