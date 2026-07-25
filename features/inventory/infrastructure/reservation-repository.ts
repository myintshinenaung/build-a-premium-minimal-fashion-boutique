import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InventoryReservationRow, ReservationStatus } from "@/lib/supabase/types";
import type { InventoryReservation } from "@/features/inventory/domain/reservation";

export type ReservationCreateInput = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
  expiresAt: string;
};

export const reservationRepository = {
  async create(input: ReservationCreateInput): Promise<InventoryReservation> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("inventory_reservations")
        .insert({
          id: input.id,
          product_id: input.productId,
          variant_id: input.variantId,
          quantity: input.quantity,
          status: "active",
          reference_type: input.referenceType ?? null,
          reference_id: input.referenceId ?? null,
          expires_at: input.expiresAt,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return reservationFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create inventory reservation", error);
    }
  },

  async getById(id: string): Promise<InventoryReservation | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("inventory_reservations").select("*").eq("id", id).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reservationFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load inventory reservation", error);
    }
  },

  async listActiveByVariant(variantId: string): Promise<InventoryReservation[]> {
    try {
      const supabase = createSupabaseServerClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("inventory_reservations")
        .select("*")
        .eq("variant_id", variantId)
        .eq("status", "active")
        .gt("expires_at", now);

      if (error) {
        throw error;
      }

      return (data ?? []).map(reservationFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load variant reservations", error);
    }
  },

  async listActiveByProduct(productId: string): Promise<InventoryReservation[]> {
    try {
      const supabase = createSupabaseServerClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("inventory_reservations")
        .select("*")
        .eq("product_id", productId)
        .eq("status", "active")
        .gt("expires_at", now);

      if (error) {
        throw error;
      }

      return (data ?? []).map(reservationFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load product reservations", error);
    }
  },

  async listExpiredActive(): Promise<InventoryReservation[]> {
    try {
      const supabase = createSupabaseServerClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("inventory_reservations")
        .select("*")
        .eq("status", "active")
        .lte("expires_at", now);

      if (error) {
        throw error;
      }

      return (data ?? []).map(reservationFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load expired reservations", error);
    }
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<InventoryReservation | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("inventory_reservations")
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reservationFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update inventory reservation", error);
    }
  },

  async decrementProductStock(productId: string, quantity: number): Promise<number> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .maybeSingle();

      if (productError) {
        throw productError;
      }

      if (!product) {
        throw new Error("Product not found.");
      }

      const nextStock = Math.max(0, product.stock_quantity - quantity);
      const { data, error } = await supabase
        .from("products")
        .update({
          stock_quantity: nextStock,
          updated_at: new Date().toISOString().slice(0, 10)
        })
        .eq("id", productId)
        .select("stock_quantity")
        .single();

      if (error) {
        throw error;
      }

      return data.stock_quantity;
    } catch (error) {
      throw createRepositoryError("Unable to decrement product stock", error);
    }
  }
};

function reservationFromRow(row: InventoryReservationRow): InventoryReservation {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    quantity: row.quantity,
    status: row.status,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
