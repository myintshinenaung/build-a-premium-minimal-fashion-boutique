import { z } from "zod";
import { FLAT_RATE_SHIPPING_METHOD } from "@/features/checkout/domain/shipping";
import { checkoutCartItemSchema } from "@/features/checkout/domain/checkout-schemas";

export const discountTypes = ["percentage", "fixed", "free_shipping"] as const;
export const customerEligibilityValues = ["all", "authenticated", "guest"] as const;

export const applyCouponInputSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required."),
  shippingMethod: z.literal(FLAT_RATE_SHIPPING_METHOD),
  items: z.array(checkoutCartItemSchema).min(1, "Your cart is empty.")
});

export const removeCouponInputSchema = z.object({
  shippingMethod: z.literal(FLAT_RATE_SHIPPING_METHOD),
  items: z.array(checkoutCartItemSchema).min(1, "Your cart is empty.")
});

const couponBaseSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required.").max(40),
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  discountType: z.enum(discountTypes),
  discountValue: z.number().int().min(0),
  minimumOrderMmk: z.number().int().min(0),
  usageLimit: z.number().int().min(1).nullable().optional(),
  expiresAt: z.union([z.literal(""), z.string().datetime()]).optional(),
  enabled: z.boolean().optional(),
  customerEligibility: z.enum(customerEligibilityValues).optional()
});

function validateCouponValues(
  value: {
    discountType: (typeof discountTypes)[number];
    discountValue: number;
  },
  context: z.RefinementCtx
) {
  if (value.discountType === "percentage" && (value.discountValue < 1 || value.discountValue > 100)) {
    context.addIssue({
      code: "custom",
      message: "Percentage discount must be between 1 and 100.",
      path: ["discountValue"]
    });
  }

  if (value.discountType === "fixed" && value.discountValue < 1) {
    context.addIssue({
      code: "custom",
      message: "Fixed discount must be greater than zero.",
      path: ["discountValue"]
    });
  }

  if (value.discountType === "free_shipping" && value.discountValue !== 0) {
    context.addIssue({
      code: "custom",
      message: "Free shipping coupons must use a discount value of 0.",
      path: ["discountValue"]
    });
  }
}

export const couponInputSchema = couponBaseSchema.superRefine((value, context) => {
  validateCouponValues(value, context);
});

export const couponUpdateInputSchema = couponBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  })
  .superRefine((value, context) => {
    if (value.discountType !== undefined && value.discountValue !== undefined) {
      validateCouponValues(
        {
          discountType: value.discountType,
          discountValue: value.discountValue
        },
        context
      );
    }
  });

export type ApplyCouponInput = z.infer<typeof applyCouponInputSchema>;
export type RemoveCouponInput = z.infer<typeof removeCouponInputSchema>;
export type CouponInput = z.infer<typeof couponInputSchema>;
export type CouponUpdateInput = z.infer<typeof couponUpdateInputSchema>;
