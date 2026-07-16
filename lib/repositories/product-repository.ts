import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, ProductRow } from "@/lib/supabase/types";
import type { AdminProduct, AdminStatus } from "@/types/admin";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductListParams = {
  search?: string;
  categoryId?: string;
  status?: AdminStatus | "All";
  sortBy?: "updatedAt" | "name" | "priceMmk" | "stockQuantity";
  sortDirection?: "asc" | "desc";
};

export type ProductCreateInput = Omit<AdminProduct, "id" | "updatedAt"> & {
  id?: string;
  updatedAt?: string;
};

export type ProductUpdateInput = Partial<Omit<AdminProduct, "id">>;

export const productRepository = {
  async list(params: ProductListParams = {}) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("products").select("*").order("updated_at", { ascending: false });
      console.log("DATA =", data);
      console.log("ERROR =", error);
      if (error) {
        throw error;
      }

      return filterAndSortProducts((data ?? []).map(productFromRow), params);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load products", error);
    }
  },

  async getById(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? productFromRow(data) : null;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load product", error);
    }
  },

  async create(input: ProductCreateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("products").insert(productToInsert(input)).select("*").single();

    if (error) {
      throw createRepositoryError("Unable to create product", error);
    }

    return productFromRow(data);
  },

  async update(id: string, input: ProductUpdateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("products").update(productToUpdate(input)).eq("id", id).select("*").maybeSingle();

    if (error) {
      throw createRepositoryError("Unable to update product", error);
    }

    return data ? productFromRow(data) : null;
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete product", error);
    }

    return true;
  },

  async bulkUpdateStatus(ids: string[], status: AdminStatus) {
    if (ids.length === 0) {
      return [];
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("products").update({ status, updated_at: currentDateStamp() }).in("id", ids).select("*");

    if (error) {
      throw createRepositoryError("Unable to update products", error);
    }

    return (data ?? []).map(productFromRow);
  },

  async bulkDelete(ids: string[]) {
    if (ids.length === 0) {
      return true;
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("products").delete().in("id", ids);

    if (error) {
      throw createRepositoryError("Unable to delete products", error);
    }

    return true;
  },

  async duplicate(id: string) {
    const product = await this.getById(id);

    if (!product) {
      return null;
    }

    const suffix = Date.now().toString().slice(-4);

    return this.create({
      ...product,
      id: `prd-copy-${suffix}`,
      name: `${product.name} Copy`,
      sku: `${product.sku}-COPY-${suffix}`,
      barcode: `${product.barcode}-${suffix}`,
      status: "Draft"
    });
  }
};

function filterAndSortProducts(products: AdminProduct[], params: ProductListParams) {
  const direction = params.sortDirection ?? "desc";
  const search = params.search?.trim().toLowerCase();

  return products
    .filter((product) => {
      const matchesSearch = !search || [product.name, product.sku, product.brand].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = !params.categoryId || product.categoryId === params.categoryId;
      const matchesStatus = !params.status || params.status === "All" || product.status === params.status;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((first, second) => compareProducts(first, second, params.sortBy ?? "updatedAt", direction));
}

function compareProducts(first: AdminProduct, second: AdminProduct, sortBy: NonNullable<ProductListParams["sortBy"]>, direction: "asc" | "desc") {
  const modifier = direction === "asc" ? 1 : -1;
  const firstValue = first[sortBy];
  const secondValue = second[sortBy];

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return (firstValue - secondValue) * modifier;
  }

  return String(firstValue).localeCompare(String(secondValue)) * modifier;
}

function productFromRow(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    categoryId: row.category_id,
    brand: row.brand,
    priceMmk: row.price_mmk,
    salePriceMmk: row.sale_price_mmk ?? undefined,
    costPriceMmk: row.cost_price_mmk,
    description: row.description,
    images: row.images,
    colors: row.colors,
    sizes: row.sizes,
    stockQuantity: row.stock_quantity,
    lowStockWarning: row.low_stock_warning,
    featured: row.featured,
    bestSeller: row.best_seller,
    newArrival: row.new_arrival,
    onSale: row.on_sale,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function productToInsert(input: ProductCreateInput): ProductInsert {
  return {
    id: input.id ?? `prd-${Date.now()}`,
    name: input.name,
    sku: input.sku,
    barcode: input.barcode,
    category_id: input.categoryId,
    brand: input.brand,
    price_mmk: input.priceMmk,
    sale_price_mmk: input.salePriceMmk ?? null,
    cost_price_mmk: input.costPriceMmk,
    description: input.description,
    images: input.images,
    colors: input.colors,
    sizes: input.sizes,
    stock_quantity: input.stockQuantity,
    low_stock_warning: input.lowStockWarning,
    featured: input.featured,
    best_seller: input.bestSeller,
    new_arrival: input.newArrival,
    on_sale: input.onSale,
    status: input.status,
    updated_at: input.updatedAt ?? currentDateStamp()
  };
}

function productToUpdate(input: ProductUpdateInput): ProductUpdate {
  const update: ProductUpdate = {
    updated_at: input.updatedAt ?? currentDateStamp()
  };

  if (input.name !== undefined) update.name = input.name;
  if (input.sku !== undefined) update.sku = input.sku;
  if (input.barcode !== undefined) update.barcode = input.barcode;
  if (input.categoryId !== undefined) update.category_id = input.categoryId;
  if (input.brand !== undefined) update.brand = input.brand;
  if (input.priceMmk !== undefined) update.price_mmk = input.priceMmk;
  if (input.salePriceMmk !== undefined) update.sale_price_mmk = input.salePriceMmk;
  if (input.costPriceMmk !== undefined) update.cost_price_mmk = input.costPriceMmk;
  if (input.description !== undefined) update.description = input.description;
  if (input.images !== undefined) update.images = input.images;
  if (input.colors !== undefined) update.colors = input.colors;
  if (input.sizes !== undefined) update.sizes = input.sizes;
  if (input.stockQuantity !== undefined) update.stock_quantity = input.stockQuantity;
  if (input.lowStockWarning !== undefined) update.low_stock_warning = input.lowStockWarning;
  if (input.featured !== undefined) update.featured = input.featured;
  if (input.bestSeller !== undefined) update.best_seller = input.bestSeller;
  if (input.newArrival !== undefined) update.new_arrival = input.newArrival;
  if (input.onSale !== undefined) update.on_sale = input.onSale;
  if (input.status !== undefined) update.status = input.status;

  return update;
}

function currentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
