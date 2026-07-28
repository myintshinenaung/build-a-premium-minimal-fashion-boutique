import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, ProductRailItemRow, ProductRailRow } from "@/lib/supabase/types";
import type { AdminProductRail, AdminProductRailItem } from "@/types/product-rail";

type ProductRailInsert = Database["public"]["Tables"]["product_rails"]["Insert"];
type ProductRailUpdate = Database["public"]["Tables"]["product_rails"]["Update"];
type ProductRailItemInsert = Database["public"]["Tables"]["product_rail_items"]["Insert"];

export type ProductRailCreateInput = Omit<AdminProductRail, "id" | "items"> & {
  id?: string;
  items: Array<Omit<AdminProductRailItem, "id" | "railId"> & { id?: string }>;
};

export type ProductRailUpdateInput = Partial<Omit<AdminProductRail, "id" | "items">> & {
  items?: Array<Omit<AdminProductRailItem, "id" | "railId"> & { id?: string }>;
};

export const productRailRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_rails")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rails = data ?? [];
      const withItems = await Promise.all(rails.map((rail) => this.getWithItems(rail.id)));
      return withItems.filter((rail): rail is AdminProductRail => rail !== null);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load product rails", error);
    }
  },

  async getWithItems(id: string): Promise<AdminProductRail | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: rail, error: railError } = await supabase.from("product_rails").select("*").eq("id", id).maybeSingle();

      if (railError) {
        throw railError;
      }

      if (!rail) {
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("product_rail_items")
        .select("*")
        .eq("rail_id", id)
        .order("sort_order", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      return productRailFromRow(rail, items ?? []);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load product rail", error);
    }
  },

  async listPublishedForStore(storeId: string): Promise<AdminProductRail[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_rails")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "Published")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rails = data ?? [];
      const withItems = await Promise.all(rails.map((rail) => this.getWithItems(rail.id)));
      return withItems.filter((rail): rail is AdminProductRail => rail !== null);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load published product rails", error);
    }
  },

  async create(input: ProductRailCreateInput) {
    const supabase = createSupabaseServerClient();
    const id = input.id ?? `pr-${Date.now()}`;
    const { error: railError } = await supabase.from("product_rails").insert(productRailToInsert({ ...input, id }));

    if (railError) {
      throw createRepositoryError("Unable to create product rail", railError);
    }

    await this.replaceItems(id, input.items);
    const created = await this.getWithItems(id);

    if (!created) {
      throw createRepositoryError("Unable to load created product rail", new Error("Product rail not found after create"));
    }

    return created;
  },

  async update(id: string, input: ProductRailUpdateInput) {
    const supabase = createSupabaseServerClient();
    const update = productRailToUpdate(input);

    if (Object.keys(update).length > 0) {
      update.updated_at = new Date().toISOString();
      const { error } = await supabase.from("product_rails").update(update).eq("id", id);

      if (error) {
        throw createRepositoryError("Unable to update product rail", error);
      }
    }

    if (input.items) {
      await this.replaceItems(id, input.items);
    }

    return this.getWithItems(id);
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("product_rails").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete product rail", error);
    }

    return true;
  },

  async duplicate(id: string) {
    const source = await this.getWithItems(id);

    if (!source) {
      throw createRepositoryError("Unable to duplicate product rail", new Error("Product rail not found"));
    }

    const duplicateId = `pr-copy-${Date.now()}`;

    return this.create({
      id: duplicateId,
      storeId: source.storeId,
      title: source.title.trim() ? `${source.title} (Copy)` : "Untitled Rail (Copy)",
      subtitle: source.subtitle,
      badgeText: source.badgeText,
      description: source.description,
      sortOrder: source.sortOrder + 1,
      startsAt: source.startsAt,
      endsAt: source.endsAt,
      status: "Draft",
      items: source.items.map((item, index) => ({
        productId: item.productId,
        sortOrder: index
      }))
    });
  },

  async replaceItems(
    railId: string,
    items: Array<Omit<AdminProductRailItem, "railId" | "id"> & { id?: string }>
  ) {
    const supabase = createSupabaseServerClient();
    const { error: deleteError } = await supabase.from("product_rail_items").delete().eq("rail_id", railId);

    if (deleteError) {
      throw createRepositoryError("Unable to replace product rail items", deleteError);
    }

    if (items.length === 0) {
      return;
    }

    const inserts: ProductRailItemInsert[] = items.map((item, index) => ({
      id: item.id ?? `pri-${railId}-${index}-${Date.now()}`,
      rail_id: railId,
      product_id: item.productId,
      sort_order: item.sortOrder ?? index
    }));

    const { error: insertError } = await supabase.from("product_rail_items").insert(inserts);

    if (insertError) {
      throw createRepositoryError("Unable to save product rail items", insertError);
    }
  }
};

function productRailFromRow(row: ProductRailRow, items: ProductRailItemRow[]): AdminProductRail {
  return {
    id: row.id,
    storeId: row.store_id,
    title: row.title,
    subtitle: row.subtitle,
    badgeText: row.badge_text,
    description: row.description,
    sortOrder: row.sort_order,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    items: items.map(productRailItemFromRow)
  };
}

function productRailItemFromRow(row: ProductRailItemRow): AdminProductRailItem {
  return {
    id: row.id,
    railId: row.rail_id,
    productId: row.product_id,
    sortOrder: row.sort_order
  };
}

function productRailToInsert(input: ProductRailCreateInput & { id: string }): ProductRailInsert {
  return {
    id: input.id,
    store_id: input.storeId,
    title: input.title,
    subtitle: input.subtitle,
    badge_text: input.badgeText,
    description: input.description,
    sort_order: input.sortOrder,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: input.status
  };
}

function productRailToUpdate(input: ProductRailUpdateInput): ProductRailUpdate {
  const update: ProductRailUpdate = {};

  if (input.storeId !== undefined) update.store_id = input.storeId;
  if (input.title !== undefined) update.title = input.title;
  if (input.subtitle !== undefined) update.subtitle = input.subtitle;
  if (input.badgeText !== undefined) update.badge_text = input.badgeText;
  if (input.description !== undefined) update.description = input.description;
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;
  if (input.startsAt !== undefined) update.starts_at = input.startsAt;
  if (input.endsAt !== undefined) update.ends_at = input.endsAt;
  if (input.status !== undefined) update.status = input.status;

  return update;
}
