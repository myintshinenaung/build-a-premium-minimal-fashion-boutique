import { z } from "zod";

export const PRODUCT_SEARCH_SORT_OPTIONS = ["newest", "price-asc", "price-desc", "popularity", "rating"] as const;

export type ProductSearchSort = (typeof PRODUCT_SEARCH_SORT_OPTIONS)[number];

export const DEFAULT_PRODUCT_SEARCH_PAGE_SIZE = 8;

function parseListParam(value: unknown) {
  if (value == null || value === "") {
    return [];
  }

  const items = Array.isArray(value) ? value : [value];

  return items
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalBoolean(value: unknown) {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return undefined;
}

export const productSearchQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional().default(""),
    category: z.preprocess(parseListParam, z.array(z.string().trim().min(1)).default([])),
    brand: z.preprocess(parseListParam, z.array(z.string().trim().min(1)).default([])),
    minPrice: z.coerce.number().finite().min(0).optional(),
    maxPrice: z.coerce.number().finite().min(0).optional(),
    color: z.string().trim().min(1).optional(),
    size: z.string().trim().min(1).optional(),
    minRating: z.coerce.number().finite().min(1).max(5).optional(),
    inStock: z.preprocess(parseOptionalBoolean, z.boolean().optional()),
    sort: z.enum(PRODUCT_SEARCH_SORT_OPTIONS).optional().default("popularity"),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(48).optional().default(DEFAULT_PRODUCT_SEARCH_PAGE_SIZE)
  })
  .superRefine((value, context) => {
    if (value.minPrice != null && value.maxPrice != null && value.minPrice > value.maxPrice) {
      context.addIssue({
        code: "custom",
        message: "Minimum price cannot exceed maximum price.",
        path: ["minPrice"]
      });
    }
  });

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;

export function parseProductSearchParams(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const params =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input;

  return productSearchQuerySchema.parse({
    q: params.q,
    category: params.category,
    brand: params.brand,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    color: params.color,
    size: params.size,
    minRating: params.minRating,
    inStock: params.inStock,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize
  });
}
