import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WishlistRow } from "@/lib/supabase/types";
import type { WishlistItem } from "@/types/wishlist";

function createWishlistId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WISH-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export const wishlistRepository = {
  async listByAccountId(accountId: string): Promise<WishlistItem[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(wishlistFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load wishlist", error);
    }
  },

  async getByAccountAndProduct(accountId: string, productId: string): Promise<WishlistItem | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("account_id", accountId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? wishlistFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load wishlist item", error);
    }
  },

  async create(accountId: string, productId: string): Promise<WishlistItem> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          id: createWishlistId(),
          account_id: accountId,
          product_id: productId,
          created_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return wishlistFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to add wishlist item", error);
    }
  },

  async deleteByAccountAndProduct(accountId: string, productId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("wishlist").delete().eq("account_id", accountId).eq("product_id", productId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw createRepositoryError("Unable to remove wishlist item", error);
    }
  }
};

function wishlistFromRow(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    accountId: row.account_id,
    productId: row.product_id,
    createdAt: row.created_at
  };
}
