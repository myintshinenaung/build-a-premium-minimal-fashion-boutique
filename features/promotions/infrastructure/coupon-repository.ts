import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CouponRow, Database } from "@/lib/supabase/types";
import type { Coupon } from "@/types/promotion";

type CouponInsert = Database["public"]["Tables"]["coupons"]["Insert"];
type CouponUpdate = Database["public"]["Tables"]["coupons"]["Update"];

export type CouponCreateInput = {
  code: string;
  name: string;
  description: string;
  discountType: Coupon["discountType"];
  discountValue: number;
  minimumOrderMmk: number;
  usageLimit: number | null;
  expiresAt: string | null;
  enabled: boolean;
  customerEligibility: Coupon["customerEligibility"];
};

export type CouponUpdateInput = Partial<CouponCreateInput>;

function createCouponId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CPN-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export const couponRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(couponFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load coupons", error);
    }
  },

  async getById(id: string): Promise<Coupon | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? couponFromRow(data) : null;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load coupon", error);
    }
  },

  async getByCode(code: string): Promise<Coupon | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("coupons").select("*").eq("code", normalizeCode(code)).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? couponFromRow(data) : null;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load coupon", error);
    }
  },

  async create(input: CouponCreateInput): Promise<Coupon> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          id: createCouponId(),
          code: normalizeCode(input.code),
          name: input.name,
          description: input.description,
          discount_type: input.discountType,
          discount_value: input.discountValue,
          minimum_order_mmk: input.minimumOrderMmk,
          usage_limit: input.usageLimit,
          usage_count: 0,
          expires_at: input.expiresAt,
          enabled: input.enabled,
          customer_eligibility: input.customerEligibility,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return couponFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create coupon", error);
    }
  },

  async update(id: string, input: CouponUpdateInput): Promise<Coupon | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("coupons")
        .update(couponToUpdate(input))
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? couponFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update coupon", error);
    }
  },

  async delete(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw createRepositoryError("Unable to delete coupon", error);
    }
  },

  async incrementUsageCount(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const coupon = await this.getById(id);

      if (!coupon) {
        return null;
      }

      const { data, error } = await supabase
        .from("coupons")
        .update({
          usage_count: coupon.usageCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? couponFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update coupon usage", error);
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

function couponToUpdate(input: CouponUpdateInput): CouponUpdate {
  const update: CouponUpdate = {
    updated_at: new Date().toISOString()
  };

  if (input.code !== undefined) update.code = normalizeCode(input.code);
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.discountType !== undefined) update.discount_type = input.discountType;
  if (input.discountValue !== undefined) update.discount_value = input.discountValue;
  if (input.minimumOrderMmk !== undefined) update.minimum_order_mmk = input.minimumOrderMmk;
  if (input.usageLimit !== undefined) update.usage_limit = input.usageLimit;
  if (input.expiresAt !== undefined) update.expires_at = input.expiresAt;
  if (input.enabled !== undefined) update.enabled = input.enabled;
  if (input.customerEligibility !== undefined) update.customer_eligibility = input.customerEligibility;

  return update;
}
