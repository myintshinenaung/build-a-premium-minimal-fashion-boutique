import type { SearchProductIndex } from "@/types/search";

const RECENTLY_VIEWED_KEY = "storefront-recently-viewed";
const MAX_RECENTLY_VIEWED = 8;

export type RecentlyViewedProduct = Pick<
  SearchProductIndex,
  "id" | "slug" | "name" | "price" | "image" | "brand" | "category"
>;

export function readRecentlyViewedProducts() {
  if (typeof window === "undefined") {
    return [] as RecentlyViewedProduct[];
  }

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.slug).slice(0, MAX_RECENTLY_VIEWED) : [];
  } catch {
    return [];
  }
}

export function writeRecentlyViewedProduct(product: RecentlyViewedProduct) {
  if (typeof window === "undefined" || !product.id) {
    return;
  }

  const next = [
    product,
    ...readRecentlyViewedProducts().filter((item) => item.id !== product.id)
  ].slice(0, MAX_RECENTLY_VIEWED);

  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}

export function clearRecentlyViewedProducts() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RECENTLY_VIEWED_KEY);
}
