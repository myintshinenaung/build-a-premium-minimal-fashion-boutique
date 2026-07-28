import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, FlashSaleItemRow, FlashSaleRow } from "@/lib/supabase/types";
import type { AdminFlashSale, AdminFlashSaleItem } from "@/types/flash-sale";

type FlashSaleInsert = Database["public"]["Tables"]["flash_sales"]["Insert"];
type FlashSaleUpdate = Database["public"]["Tables"]["flash_sales"]["Update"];
type FlashSaleItemInsert = Database["public"]["Tables"]["flash_sale_items"]["Insert"];

export type FlashSaleCreateInput = Omit<AdminFlashSale, "id" | "items"> & {
  id?: string;
  items: Array<Omit<AdminFlashSaleItem, "id" | "flashSaleId"> & { id?: string }>;
};

export type FlashSaleUpdateInput = Partial<Omit<AdminFlashSale, "id" | "items">> & {
  items?: Array<Omit<AdminFlashSaleItem, "id" | "flashSaleId"> & { id?: string }>;
};

export const flashSaleRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("flash_sales").select("*").order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const sales = data ?? [];
      const withItems = await Promise.all(sales.map((sale) => this.getWithItems(sale.id)));
      return withItems.filter((sale): sale is AdminFlashSale => sale !== null);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load flash sales", error);
    }
  },

  async getWithItems(id: string): Promise<AdminFlashSale | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: sale, error: saleError } = await supabase.from("flash_sales").select("*").eq("id", id).maybeSingle();

      if (saleError) {
        throw saleError;
      }

      if (!sale) {
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("flash_sale_items")
        .select("*")
        .eq("flash_sale_id", id)
        .order("sort_order", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      return flashSaleFromRow(sale, items ?? []);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load flash sale", error);
    }
  },

  async getActiveForStore(storeId: string): Promise<AdminFlashSale | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "Published")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.getWithItems(data.id);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load active flash sale", error);
    }
  },

  async create(input: FlashSaleCreateInput) {
    const supabase = createSupabaseServerClient();
    const id = input.id ?? `fs-${Date.now()}`;
    const { error: saleError } = await supabase.from("flash_sales").insert(flashSaleToInsert({ ...input, id }));

    if (saleError) {
      throw createRepositoryError("Unable to create flash sale", saleError);
    }

    await this.replaceItems(id, input.items);
    const created = await this.getWithItems(id);

    if (!created) {
      throw createRepositoryError("Unable to load created flash sale", new Error("Flash sale not found after create"));
    }

    return created;
  },

  async update(id: string, input: FlashSaleUpdateInput) {
    const supabase = createSupabaseServerClient();
    const update = flashSaleToUpdate(input);

    if (Object.keys(update).length > 0) {
      update.updated_at = new Date().toISOString();
      const { error } = await supabase.from("flash_sales").update(update).eq("id", id);

      if (error) {
        throw createRepositoryError("Unable to update flash sale", error);
      }
    }

    if (input.items) {
      await this.replaceItems(id, input.items);
    }

    return this.getWithItems(id);
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("flash_sales").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete flash sale", error);
    }

    return true;
  },

  async replaceItems(
    flashSaleId: string,
    items: Array<Omit<AdminFlashSaleItem, "flashSaleId" | "id"> & { id?: string }>
  ) {
    const supabase = createSupabaseServerClient();
    const { error: deleteError } = await supabase.from("flash_sale_items").delete().eq("flash_sale_id", flashSaleId);

    if (deleteError) {
      throw createRepositoryError("Unable to replace flash sale items", deleteError);
    }

    if (items.length === 0) {
      return;
    }

    const inserts: FlashSaleItemInsert[] = items.map((item, index) => ({
      id: item.id ?? `fsi-${flashSaleId}-${index}-${Date.now()}`,
      flash_sale_id: flashSaleId,
      product_id: item.productId,
      discount_percent: item.discountPercent,
      sort_order: item.sortOrder ?? index
    }));

    const { error: insertError } = await supabase.from("flash_sale_items").insert(inserts);

    if (insertError) {
      throw createRepositoryError("Unable to save flash sale items", insertError);
    }
  }
};

function flashSaleFromRow(row: FlashSaleRow, items: FlashSaleItemRow[]): AdminFlashSale {
  const record = row as FlashSaleRow & {
    store_id?: string;
    section_title?: string;
    section_subtitle?: string;
    badge_text?: string;
    starts_at?: string | null;
    ends_at?: string | null;
  };

  return {
    id: record.id,
    storeId: record.store_id ?? "daily-outfit",
    sectionTitle: record.section_title ?? "",
    sectionSubtitle: record.section_subtitle ?? "",
    badgeText: record.badge_text ?? "",
    startsAt: record.starts_at ?? null,
    endsAt: record.ends_at ?? null,
    status: record.status,
    items: items.map(flashSaleItemFromRow)
  };
}

function flashSaleItemFromRow(row: FlashSaleItemRow): AdminFlashSaleItem {
  return {
    id: row.id,
    flashSaleId: row.flash_sale_id,
    productId: row.product_id,
    discountPercent: row.discount_percent,
    sortOrder: row.sort_order
  };
}

function flashSaleToInsert(input: FlashSaleCreateInput & { id: string }): FlashSaleInsert {
  return {
    id: input.id,
    store_id: input.storeId,
    section_title: input.sectionTitle,
    section_subtitle: input.sectionSubtitle,
    badge_text: input.badgeText,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: input.status
  };
}

function flashSaleToUpdate(input: FlashSaleUpdateInput): FlashSaleUpdate {
  const update: FlashSaleUpdate = {};

  if (input.storeId !== undefined) update.store_id = input.storeId;
  if (input.sectionTitle !== undefined) update.section_title = input.sectionTitle;
  if (input.sectionSubtitle !== undefined) update.section_subtitle = input.sectionSubtitle;
  if (input.badgeText !== undefined) update.badge_text = input.badgeText;
  if (input.startsAt !== undefined) update.starts_at = input.startsAt;
  if (input.endsAt !== undefined) update.ends_at = input.endsAt;
  if (input.status !== undefined) update.status = input.status;

  return update;
}
