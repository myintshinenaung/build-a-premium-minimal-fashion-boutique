import type { Coupon, CustomerEligibility, PromotionRule } from "@/types/promotion";

export type PromotionValidationContext = {
  subtotalMmk: number;
  isAuthenticated: boolean;
  now?: Date;
};

export type PromotionValidationFailure =
  | "expired"
  | "disabled"
  | "usage_exceeded"
  | "minimum_order"
  | "customer_eligibility";

export function toPromotionRule(coupon: Coupon): PromotionRule {
  return {
    minimumOrderMmk: coupon.minimumOrderMmk,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    expiresAt: coupon.expiresAt,
    enabled: coupon.enabled,
    customerEligibility: coupon.customerEligibility
  };
}

export function isCouponExpired(rule: PromotionRule, now = new Date()) {
  if (!rule.expiresAt) {
    return false;
  }

  return new Date(rule.expiresAt).getTime() <= now.getTime();
}

export function isCouponDisabled(rule: PromotionRule) {
  return !rule.enabled;
}

export function isUsageLimitExceeded(rule: PromotionRule) {
  if (rule.usageLimit === null) {
    return false;
  }

  return rule.usageCount >= rule.usageLimit;
}

export function meetsMinimumOrder(rule: PromotionRule, subtotalMmk: number) {
  return subtotalMmk >= rule.minimumOrderMmk;
}

export function isCustomerEligible(eligibility: CustomerEligibility, isAuthenticated: boolean) {
  if (eligibility === "all") {
    return true;
  }

  if (eligibility === "authenticated") {
    return isAuthenticated;
  }

  return !isAuthenticated;
}

export function validatePromotionRule(
  rule: PromotionRule,
  context: PromotionValidationContext
): PromotionValidationFailure | null {
  const now = context.now ?? new Date();

  if (isCouponDisabled(rule)) {
    return "disabled";
  }

  if (isCouponExpired(rule, now)) {
    return "expired";
  }

  if (isUsageLimitExceeded(rule)) {
    return "usage_exceeded";
  }

  if (!meetsMinimumOrder(rule, context.subtotalMmk)) {
    return "minimum_order";
  }

  if (!isCustomerEligible(rule.customerEligibility, context.isAuthenticated)) {
    return "customer_eligibility";
  }

  return null;
}

export function promotionValidationMessage(failure: PromotionValidationFailure) {
  switch (failure) {
    case "expired":
      return "This coupon has expired.";
    case "disabled":
      return "This coupon is disabled.";
    case "usage_exceeded":
      return "This coupon has reached its usage limit.";
    case "minimum_order":
      return "Your order does not meet the minimum required for this coupon.";
    case "customer_eligibility":
      return "This coupon is not available for your account.";
  }
}
