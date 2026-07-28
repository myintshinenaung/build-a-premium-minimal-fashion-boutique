import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Database,
  FeaturedCollectionItemRow,
  FeaturedCollectionRow
} from "@/lib/supabase/types";
import type { AdminFeaturedCollection, AdminFeaturedCollectionItem } from "@/types/featured-collection";

type FeaturedCollectionInsert = Database["public"]["Tables"]["featured_collections"]["Insert"];
type FeaturedCollectionUpdate = Database["public"]["Tables"]["featured_collections"]["Update"];
type FeaturedCollectionItemInsert = Database["public"]["Tables"]["featured_collection_items"]["Insert"];

export type FeaturedCollectionCreateInput = Omit<AdminFeaturedCollection, "id" | "items"> & {
  id?: string;
  items: Array<Omit<AdminFeaturedCollectionItem, "id" | "collectionId"> & { id?: string }>;
};

export type FeaturedCollectionUpdateInput = Partial<Omit<AdminFeaturedCollection, "id" | "items">> & {
  items?: Array<Omit<AdminFeaturedCollectionItem, "id" | "collectionId"> & { id?: string }>;
};

export const featuredCollectionRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("featured_collections")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const collections = data ?? [];
      const withItems = await Promise.all(collections.map((collection) => this.getWithItems(collection.id)));
      return withItems.filter((collection): collection is AdminFeaturedCollection => collection !== null);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load featured collections", error);
    }
  },

  async getWithItems(id: string): Promise<AdminFeaturedCollection | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: collection, error: collectionError } = await supabase
        .from("featured_collections")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (collectionError) {
        throw collectionError;
      }

      if (!collection) {
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("featured_collection_items")
        .select("*")
        .eq("collection_id", id)
        .order("sort_order", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      return featuredCollectionFromRow(collection, items ?? []);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load featured collection", error);
    }
  },

  async listPublishedForStore(storeId: string): Promise<AdminFeaturedCollection[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("featured_collections")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "Published")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const collections = data ?? [];
      const withItems = await Promise.all(collections.map((collection) => this.getWithItems(collection.id)));
      return withItems.filter((collection): collection is AdminFeaturedCollection => collection !== null);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load published featured collections", error);
    }
  },

  async create(input: FeaturedCollectionCreateInput) {
    const supabase = createSupabaseServerClient();
    const id = input.id ?? `fc-${Date.now()}`;
    const { error: collectionError } = await supabase
      .from("featured_collections")
      .insert(featuredCollectionToInsert({ ...input, id }));

    if (collectionError) {
      throw createRepositoryError("Unable to create featured collection", collectionError);
    }

    await this.replaceItems(id, input.items);
    const created = await this.getWithItems(id);

    if (!created) {
      throw createRepositoryError("Unable to load created featured collection", new Error("Collection not found after create"));
    }

    return created;
  },

  async update(id: string, input: FeaturedCollectionUpdateInput) {
    const supabase = createSupabaseServerClient();
    const update = featuredCollectionToUpdate(input);

    if (Object.keys(update).length > 0) {
      update.updated_at = new Date().toISOString();
      const { error } = await supabase.from("featured_collections").update(update).eq("id", id);

      if (error) {
        throw createRepositoryError("Unable to update featured collection", error);
      }
    }

    if (input.items) {
      await this.replaceItems(id, input.items);
    }

    return this.getWithItems(id);
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("featured_collections").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete featured collection", error);
    }

    return true;
  },

  async replaceItems(
    collectionId: string,
    items: Array<Omit<AdminFeaturedCollectionItem, "collectionId" | "id"> & { id?: string }>
  ) {
    const supabase = createSupabaseServerClient();
    const { error: deleteError } = await supabase
      .from("featured_collection_items")
      .delete()
      .eq("collection_id", collectionId);

    if (deleteError) {
      throw createRepositoryError("Unable to replace featured collection items", deleteError);
    }

    if (items.length === 0) {
      return;
    }

    const inserts: FeaturedCollectionItemInsert[] = items.map((item, index) => ({
      id: item.id ?? `fci-${collectionId}-${index}-${Date.now()}`,
      collection_id: collectionId,
      product_id: item.productId,
      sort_order: item.sortOrder ?? index
    }));

    const { error: insertError } = await supabase.from("featured_collection_items").insert(inserts);

    if (insertError) {
      throw createRepositoryError("Unable to save featured collection items", insertError);
    }
  }
};

function featuredCollectionFromRow(
  row: FeaturedCollectionRow,
  items: FeaturedCollectionItemRow[]
): AdminFeaturedCollection {
  return {
    id: row.id,
    storeId: row.store_id,
    title: row.title,
    subtitle: row.subtitle,
    coverImage: row.cover_image,
    buttonText: row.button_text,
    buttonUrl: row.button_url,
    sortOrder: row.sort_order,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    items: items.map(featuredCollectionItemFromRow)
  };
}

function featuredCollectionItemFromRow(row: FeaturedCollectionItemRow): AdminFeaturedCollectionItem {
  return {
    id: row.id,
    collectionId: row.collection_id,
    productId: row.product_id,
    sortOrder: row.sort_order
  };
}

function featuredCollectionToInsert(input: FeaturedCollectionCreateInput & { id: string }): FeaturedCollectionInsert {
  return {
    id: input.id,
    store_id: input.storeId,
    title: input.title,
    subtitle: input.subtitle,
    cover_image: input.coverImage,
    button_text: input.buttonText,
    button_url: input.buttonUrl,
    sort_order: input.sortOrder,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: input.status
  };
}

function featuredCollectionToUpdate(input: FeaturedCollectionUpdateInput): FeaturedCollectionUpdate {
  const update: FeaturedCollectionUpdate = {};

  if (input.storeId !== undefined) update.store_id = input.storeId;
  if (input.title !== undefined) update.title = input.title;
  if (input.subtitle !== undefined) update.subtitle = input.subtitle;
  if (input.coverImage !== undefined) update.cover_image = input.coverImage;
  if (input.buttonText !== undefined) update.button_text = input.buttonText;
  if (input.buttonUrl !== undefined) update.button_url = input.buttonUrl;
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;
  if (input.startsAt !== undefined) update.starts_at = input.startsAt;
  if (input.endsAt !== undefined) update.ends_at = input.endsAt;
  if (input.status !== undefined) update.status = input.status;

  return update;
}
