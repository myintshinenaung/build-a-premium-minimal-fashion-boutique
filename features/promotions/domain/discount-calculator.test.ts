import { describe, expect, it } from "vitest";
import {
  buildEmptyOrderSummary,
  calculateDiscount,
  calculateDiscountAmount
} from "@/features/promotions/domain/discount-calculator";
import type { Coupon } from "@/types/promotion";

function createCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: "CPN-1",
    code: "SAVE10",
    name: "Save 10%",
    description: "Ten percent off",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderMmk: 0,
    usageLimit: null,
    usageCount: 0,
    expiresAt: null,
    enabled: true,
    customerEligibility: "all",
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    ...overrides
  };
}

describe("discount-calculator", () => {
  it("calculates percentage discounts without exceeding subtotal", () => {
    expect(calculateDiscountAmount(createCoupon({ discountValue: 10 }), 150000)).toBe(15000);
    expect(calculateDiscountAmount(createCoupon({ discountValue: 100 }), 150000)).toBe(150000);
  });

  it("calculates fixed discounts without exceeding subtotal", () => {
    expect(calculateDiscountAmount(createCoupon({ discountType: "fixed", discountValue: 5000 }), 150000)).toBe(5000);
    expect(calculateDiscountAmount(createCoupon({ discountType: "fixed", discountValue: 200000 }), 150000)).toBe(150000);
  });

  it("waives shipping for free shipping coupons", () => {
    const summary = calculateDiscount(createCoupon({ discountType: "free_shipping", discountValue: 0 }), 150000, 3000);

    expect(summary.discountMmk).toBe(0);
    expect(summary.shippingMmk).toBe(0);
    expect(summary.totalMmk).toBe(150000);
    expect(summary.coupon?.freeShipping).toBe(true);
  });

  it("builds an empty summary when no coupon is applied", () => {
    expect(buildEmptyOrderSummary(150000, 3000)).toEqual({
      subtotalMmk: 150000,
      discountMmk: 0,
      shippingMmk: 3000,
      taxMmk: 0,
      totalMmk: 153000,
      coupon: null
    });
  });
});
