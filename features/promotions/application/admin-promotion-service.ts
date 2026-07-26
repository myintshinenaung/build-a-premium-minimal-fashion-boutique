import { couponInputSchema, couponUpdateInputSchema } from "@/features/promotions/domain/promotion-schemas";
import { CouponNotFoundError, PromotionValidationError } from "@/features/promotions/application/promotion-errors";
import {
  couponRepository,
  type CouponCreateInput,
  type CouponUpdateInput
} from "@/features/promotions/infrastructure/coupon-repository";
import { promotionRepository } from "@/features/promotions/infrastructure/promotion-repository";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid coupon details.";
}

function normalizeCouponInput(input: {
  code: string;
  name: string;
  description?: string;
  discountType: CouponCreateInput["discountType"];
  discountValue: number;
  minimumOrderMmk: number;
  usageLimit?: number | null;
  expiresAt?: string;
  enabled?: boolean;
  customerEligibility?: CouponCreateInput["customerEligibility"];
}): CouponCreateInput {
  return {
    code: input.code,
    name: input.name,
    description: input.description?.trim() ?? "",
    discountType: input.discountType,
    discountValue: input.discountType === "free_shipping" ? 0 : input.discountValue,
    minimumOrderMmk: input.minimumOrderMmk,
    usageLimit: input.usageLimit ?? null,
    expiresAt: input.expiresAt?.trim() ? input.expiresAt : null,
    enabled: input.enabled ?? true,
    customerEligibility: input.customerEligibility ?? "all"
  };
}

export const promotionAdminService = {
  listCoupons() {
    return couponRepository.list();
  },

  getCoupon(id: string) {
    return couponRepository.getById(id);
  },

  createCoupon(input: unknown) {
    try {
      const parsed = couponInputSchema.parse(input);
      return couponRepository.create(normalizeCouponInput(parsed));
    } catch (error) {
      if (error instanceof ZodError) {
        throw new PromotionValidationError(formatZodError(error));
      }

      throw error;
    }
  },

  updateCoupon(id: string, input: unknown) {
    try {
      const parsed = couponUpdateInputSchema.parse(input);
      const update: CouponUpdateInput = {};

      if (parsed.code !== undefined) update.code = parsed.code;
      if (parsed.name !== undefined) update.name = parsed.name;
      if (parsed.description !== undefined) update.description = parsed.description.trim();
      if (parsed.discountType !== undefined) update.discountType = parsed.discountType;
      if (parsed.discountValue !== undefined) update.discountValue = parsed.discountValue;
      if (parsed.minimumOrderMmk !== undefined) update.minimumOrderMmk = parsed.minimumOrderMmk;
      if (parsed.usageLimit !== undefined) update.usageLimit = parsed.usageLimit;
      if (parsed.expiresAt !== undefined) update.expiresAt = parsed.expiresAt.trim() ? parsed.expiresAt : null;
      if (parsed.enabled !== undefined) update.enabled = parsed.enabled;
      if (parsed.customerEligibility !== undefined) update.customerEligibility = parsed.customerEligibility;

      if (update.discountType === "free_shipping") {
        update.discountValue = 0;
      }

      return couponRepository.update(id, update);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new PromotionValidationError(formatZodError(error));
      }

      throw error;
    }
  },

  deleteCoupon(id: string) {
    return couponRepository.delete(id);
  },

  async setCouponEnabled(id: string, enabled: boolean) {
    const coupon = await couponRepository.update(id, { enabled });

    if (!coupon) {
      throw new CouponNotFoundError("Coupon not found.");
    }

    return coupon;
  },

  listActivePromotions() {
    return promotionRepository.listActivePromotions();
  }
};
