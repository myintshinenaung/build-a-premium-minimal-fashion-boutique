import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CategoryRow, Database } from "@/lib/supabase/types";
import type { AdminCategory } from "@/types/admin";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type CategoryCreateInput = Omit<AdminCategory, "id"> & {
  id?: string;
};

export type CategoryUpdateInput = Partial<Omit<AdminCategory, "id">>;

export const categoryRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map(categoryFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load categories", error);
    }
  },

  async getById(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? categoryFromRow(data) : null;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load category", error);
    }
  },

  async create(input: CategoryCreateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("categories").insert(categoryToInsert(input)).select("*").single();

    if (error) {
      throw createRepositoryError("Unable to create category", error);
    }

    return categoryFromRow(data);
  },

  async update(id: string, input: CategoryUpdateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("categories").update(categoryToUpdate(input)).eq("id", id).select("*").maybeSingle();

    if (error) {
      throw createRepositoryError("Unable to update category", error);
    }

    return data ? categoryFromRow(data) : null;
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete category", error);
    }

    return true;
  },

  async reorder(ids: string[]) {
    const supabase = createSupabaseServerClient();

    await Promise.all(
      ids.map(async (id, index) => {
        const { error } = await supabase.from("categories").update({ sort_order: index + 1 }).eq("id", id);

        if (error) {
          throw error;
        }
      })
    );

    return this.list();
  }
};

function categoryFromRow(row: CategoryRow): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    productCount: row.product_count,
    sortOrder: row.sort_order,
    status: row.status
  };
}

function categoryToInsert(input: CategoryCreateInput): CategoryInsert {
  return {
    id: input.id ?? `cat-${Date.now()}`,
    name: input.name,
    slug: input.slug,
    description: input.description,
    image: input.image,
    product_count: input.productCount,
    sort_order: input.sortOrder,
    status: input.status
  };
}

function categoryToUpdate(input: CategoryUpdateInput): CategoryUpdate {
  const update: CategoryUpdate = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.slug !== undefined) update.slug = input.slug;
  if (input.description !== undefined) update.description = input.description;
  if (input.image !== undefined) update.image = input.image;
  if (input.productCount !== undefined) update.product_count = input.productCount;
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder;
  if (input.status !== undefined) update.status = input.status;

  return update;
}
