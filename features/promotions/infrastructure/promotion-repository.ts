import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CouponRow } from "@/lib/supabase/types";
import type { Coupon, PublicPromotion } from "@/types/promotion";

function isActiveCoupon(row: CouponRow, now = new Date()) {
  if (!row.enabled) {
    return false;
  }

  if (!row.expires_at) {
    return true;
  }

  return new Date(row.expires_at).getTime() > now.getTime();
}

export const promotionRepository = {
  async listActivePromotions(): Promise<PublicPromotion[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("coupons").select("*").eq("enabled", true).order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).filter((row) => isActiveCoupon(row)).map(publicPromotionFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load promotions", error);
    }
  },

  async getActivePromotionByCode(code: string): Promise<Coupon | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("coupons").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();

      if (error) {
        throw error;
      }

      if (!data || !isActiveCoupon(data)) {
        return null;
      }

      return couponFromRow(data);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load promotion", error);
    }
  }
};

function couponFromRow(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    minimumOrderMmk: row.minimum_order_mmk,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    expiresAt: row.expires_at,
    enabled: row.enabled,
    customerEligibility: row.customer_eligibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicPromotionFromRow(row: CouponRow): PublicPromotion {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    minimumOrderMmk: row.minimum_order_mmk,
    expiresAt: row.expires_at
  };
}
