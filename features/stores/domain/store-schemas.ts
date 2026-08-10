import { z } from "zod";

export const storeStatusSchema = z.enum(["active", "inactive"]);

const storeBaseFields = {
  name: z.string().trim().min(1, "Store name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  logo: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  description: z.string().trim().max(500).optional(),
  monogram: z.string().trim().max(4).optional(),
  status: storeStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  platformCategoryIds: z.array(z.string().trim().min(1)).optional()
};

/** Full create payload with defaults for optional fields. */
export const storeInputSchema = z.object({
  name: storeBaseFields.name,
  slug: storeBaseFields.slug,
  logo: z.string().trim().optional().default(""),
  coverImage: z.string().trim().optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  monogram: z.string().trim().max(4).optional().default(""),
  status: storeStatusSchema.optional().default("inactive"),
  sortOrder: z.number().int().min(0).optional().default(0),
  platformCategoryIds: z.array(z.string().trim().min(1)).optional().default([])
});

/** Partial update payload — no defaults so omitted fields are not wiped. */
export const storeUpdateSchema = z.object(storeBaseFields).partial();

export type StoreInput = z.infer<typeof storeInputSchema>;
export type StoreUpdateParsed = z.infer<typeof storeUpdateSchema>;

export function slugifyStoreName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildStoreHref(store: { slug: string; status: "active" | "inactive" }) {
  return store.status === "active" ? `/stores/${store.slug}` : null;
}

export function deriveMonogram(name: string, fallback = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return fallback.slice(0, 2).toUpperCase() || "ST";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
