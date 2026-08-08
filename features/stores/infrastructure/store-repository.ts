import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { PlatformCategory, Store, StoreCreateInput, StoreStatus, StoreUpdateInput } from "@/types/store";

type StoreRow = Database["public"]["Tables"]["stores"]["Row"];
type PlatformCategoryRow = Database["public"]["Tables"]["platform_categories"]["Row"];
type StorePlatformCategoryRow = Database["public"]["Tables"]["store_platform_categories"]["Row"];

export const storeRepository = {
  async list(): Promise<Store[]> {
    try {
      const supabase = createSupabaseServerClient();
      const [{ data: stores, error: storesError }, { data: links, error: linksError }] = await Promise.all([
        supabase.from("stores").select("*").order("sort_order", { ascending: true }),
        supabase.from("store_platform_categories").select("*").order("sort_order", { ascending: true })
      ]);

      if (storesError) throw storesError;
      if (linksError) throw linksError;

      return (stores ?? []).map((row) =>
        storeFromRow(row as StoreRow, (links as StorePlatformCategoryRow[] | null) ?? [])
      );
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load stores", error);
    }
  },

  async listActive(): Promise<Store[]> {
    const stores = await this.list();
    return stores.filter((store) => store.status === "active");
  },

  async getById(id: string): Promise<Store | null> {
    const stores = await this.list();
    return stores.find((store) => store.id === id) ?? null;
  },

  async getBySlug(slug: string): Promise<Store | null> {
    const stores = await this.list();
    return stores.find((store) => store.slug === slug) ?? null;
  },

  async listPlatformCategories(): Promise<PlatformCategory[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("platform_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return ((data as PlatformCategoryRow[] | null) ?? []).map(platformCategoryFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load platform categories", error);
    }
  },

  async listByPlatformCategorySlug(slug: string): Promise<Store[]> {
    const [stores, platformCategories] = await Promise.all([this.list(), this.listPlatformCategories()]);
    const platformCategory = platformCategories.find((entry) => entry.slug === slug && entry.status === "active");

    if (!platformCategory) {
      return [];
    }

    return stores.filter((store) => store.platformCategoryIds.includes(platformCategory.id));
  },

  async create(input: StoreCreateInput): Promise<Store> {
    const supabase = createSupabaseServerClient();
    const id = input.id ?? input.slug;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("stores")
      .insert({
        id,
        name: input.name,
        slug: input.slug,
        logo: input.logo ?? "",
        cover_image: input.coverImage ?? "",
        description: input.description ?? "",
        monogram: input.monogram ?? "",
        status: input.status ?? "inactive",
        sort_order: input.sortOrder ?? 0,
        created_at: now,
        updated_at: now
      })
      .select("*")
      .single();

    if (error) {
      throw createRepositoryError("Unable to create store", error);
    }

    await replaceStorePlatformCategories(id, input.platformCategoryIds ?? []);
    const created = await this.getById(id);
    if (!created) {
      throw createRepositoryError("Unable to load created store", new Error("Store missing after create"));
    }

    return created;
  },

  async update(id: string, input: StoreUpdateInput): Promise<Store | null> {
    const supabase = createSupabaseServerClient();
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (input.name !== undefined) update.name = input.name;
    if (input.slug !== undefined) update.slug = input.slug;
    if (input.logo !== undefined) update.logo = input.logo;
    if (input.coverImage !== undefined) update.cover_image = input.coverImage;
    if (input.description !== undefined) update.description = input.description;
    if (input.monogram !== undefined) update.monogram = input.monogram;
    if (input.status !== undefined) update.status = input.status;
    if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;

    const { error } = await supabase.from("stores").update(update).eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to update store", error);
    }

    if (input.platformCategoryIds !== undefined) {
      await replaceStorePlatformCategories(id, input.platformCategoryIds);
    }

    return this.getById(id);
  }
};

async function replaceStorePlatformCategories(storeId: string, platformCategoryIds: string[]) {
  const supabase = createSupabaseServerClient();
  const { error: deleteError } = await supabase.from("store_platform_categories").delete().eq("store_id", storeId);

  if (deleteError) {
    throw createRepositoryError("Unable to update store platform categories", deleteError);
  }

  if (platformCategoryIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("store_platform_categories").insert(
    platformCategoryIds.map((platformCategoryId, index) => ({
      store_id: storeId,
      platform_category_id: platformCategoryId,
      sort_order: index
    }))
  );

  if (insertError) {
    throw createRepositoryError("Unable to link store platform categories", insertError);
  }
}

function storeFromRow(row: StoreRow, links: StorePlatformCategoryRow[]): Store {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    coverImage: row.cover_image,
    description: row.description,
    monogram: row.monogram,
    status: row.status as StoreStatus,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    platformCategoryIds: links.filter((link) => link.store_id === row.id).map((link) => link.platform_category_id)
  };
}

function platformCategoryFromRow(row: PlatformCategoryRow): PlatformCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    sortOrder: row.sort_order,
    status: row.status as StoreStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
