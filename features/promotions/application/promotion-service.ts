import { validateCheckoutCart } from "@/features/checkout/application/validate-cart";
import { getShippingFee } from "@/features/shipping/server";
import { buildEmptyOrderSummary, calculateDiscount as calculatePromotionDiscount } from "@/features/promotions/domain/discount-calculator";
import {
  promotionValidationMessage,
  toPromotionRule,
  validatePromotionRule
} from "@/features/promotions/domain/validation";
import { applyCouponInputSchema, removeCouponInputSchema, type ApplyCouponInput } from "@/features/promotions/domain/promotion-schemas";
import { CouponNotFoundError, PromotionValidationError } from "@/features/promotions/application/promotion-errors";
import { couponRepository } from "@/features/promotions/infrastructure/coupon-repository";
import type { Coupon, OrderSummary } from "@/types/promotion";
import { ZodError } from "zod";

export type ValidateCouponContext = {
  subtotalMmk: number;
  isAuthenticated: boolean;
};

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid promotion details.";
}

export async function validateCoupon(code: string, context: ValidateCouponContext): Promise<Coupon> {
  const coupon = await couponRepository.getByCode(code);

  if (!coupon) {
    throw new CouponNotFoundError("Coupon not found.");
  }

  const failure = validatePromotionRule(toPromotionRule(coupon), {
    subtotalMmk: context.subtotalMmk,
    isAuthenticated: context.isAuthenticated
  });

  if (failure) {
    throw new PromotionValidationError(promotionValidationMessage(failure));
  }

  return coupon;
}

export async function calculateDiscount(
  coupon: Coupon,
  subtotalMmk: number,
  shippingMmk: number,
  taxMmk = 0
): Promise<OrderSummary> {
  return calculatePromotionDiscount(coupon, subtotalMmk, shippingMmk, taxMmk);
}

export async function applyCoupon(input: unknown, options?: { isAuthenticated?: boolean }): Promise<OrderSummary> {
  let parsed: ApplyCouponInput;

  try {
    parsed = applyCouponInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new PromotionValidationError(formatZodError(error));
    }

    throw error;
  }

  const validatedCart = await validateCheckoutCart(parsed.items);
  const shippingMmk = await getShippingFee(parsed.shippingMethod);
  const coupon = await validateCoupon(parsed.code, {
    subtotalMmk: validatedCart.subtotalMmk,
    isAuthenticated: options?.isAuthenticated ?? false
  });

  return calculatePromotionDiscount(coupon, validatedCart.subtotalMmk, shippingMmk);
}

export async function removeCoupon(input: unknown): Promise<OrderSummary> {
  let parsed;

  try {
    parsed = removeCouponInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new PromotionValidationError(formatZodError(error));
    }

    throw error;
  }

  const validatedCart = await validateCheckoutCart(parsed.items);
  const shippingMmk = await getShippingFee(parsed.shippingMethod);

  return buildEmptyOrderSummary(validatedCart.subtotalMmk, shippingMmk);
}

export async function resolveCheckoutPromotion(
  couponCode: string | undefined,
  subtotalMmk: number,
  shippingMmk: number,
  options?: { isAuthenticated?: boolean }
) {
  if (!couponCode?.trim()) {
    return {
      summary: buildEmptyOrderSummary(subtotalMmk, shippingMmk),
      coupon: null as Coupon | null
    };
  }

  const coupon = await validateCoupon(couponCode, {
    subtotalMmk,
    isAuthenticated: options?.isAuthenticated ?? false
  });
  const summary = await calculatePromotionDiscount(coupon, subtotalMmk, shippingMmk);

  return { summary, coupon };
}

export async function recordCouponRedemption(couponId: string) {
  return couponRepository.incrementUsageCount(couponId);
}
