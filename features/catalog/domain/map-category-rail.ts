import type { AdminCategory } from "@/types/admin";

/** Storefront category rail item — fully driven by dashboard category records. */
export type CategoryRailItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
};

export function mapAdminCategoryToRailItem(category: AdminCategory): CategoryRailItem {
  return {
    id: category.id,
    name: category.name.trim(),
    slug: category.slug.trim(),
    image: category.image.trim(),
    sortOrder: category.sortOrder
  };
}
