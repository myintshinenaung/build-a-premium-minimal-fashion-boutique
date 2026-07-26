import { describe, expect, it } from "vitest";
import {
  isCouponDisabled,
  isCouponExpired,
  isCustomerEligible,
  isUsageLimitExceeded,
  meetsMinimumOrder,
  promotionValidationMessage,
  toPromotionRule,
  validatePromotionRule
} from "@/features/promotions/domain/validation";
import type { Coupon } from "@/types/promotion";

function createCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: "CPN-1",
    code: "SAVE10",
    name: "Save 10%",
    description: "Ten percent off",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderMmk: 100000,
    usageLimit: 5,
    usageCount: 0,
    expiresAt: "2026-12-31T23:59:59.000Z",
    enabled: true,
    customerEligibility: "all",
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    ...overrides
  };
}

describe("promotion validation", () => {
  it("detects expired, disabled, and usage exceeded coupons", () => {
    const rule = toPromotionRule(createCoupon());
    const now = new Date("2027-01-01T00:00:00.000Z");

    expect(isCouponExpired(rule, now)).toBe(true);
    expect(isCouponDisabled(toPromotionRule(createCoupon({ enabled: false })))).toBe(true);
    expect(isUsageLimitExceeded(toPromotionRule(createCoupon({ usageCount: 5 })))).toBe(true);
  });

  it("validates minimum order and customer eligibility", () => {
    expect(meetsMinimumOrder(toPromotionRule(createCoupon({ minimumOrderMmk: 100000 })), 90000)).toBe(false);
    expect(isCustomerEligible("authenticated", false)).toBe(false);
    expect(isCustomerEligible("guest", true)).toBe(false);
  });

  it("returns validation messages for each failure", () => {
    expect(promotionValidationMessage("expired")).toContain("expired");
    expect(promotionValidationMessage("minimum_order")).toContain("minimum");
  });

  it("accepts valid coupons", () => {
    expect(
      validatePromotionRule(toPromotionRule(createCoupon()), {
        subtotalMmk: 150000,
        isAuthenticated: false,
        now: new Date("2026-07-27T00:00:00.000Z")
      })
    ).toBeNull();
  });
});
