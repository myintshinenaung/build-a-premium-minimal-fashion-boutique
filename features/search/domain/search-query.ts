import type { SearchProductIndex } from "@/types/search";
import { PLATFORM_STORES } from "@/lib/storefront/brand";
import { tokenizeSearchQuery } from "@/features/search/domain/product-search";

export const TRENDING_SEARCH_TERMS = [
  "linen dress",
  "wide leg jeans",
  "blazer vest",
  "mini tote",
  "new arrivals"
] as const;

export const RECOMMENDED_KEYWORDS = [
  "linen dress",
  "wide leg jeans",
  "blazer vest",
  "mini tote",
  "daily outfit",
  "new season"
] as const;

export const MARKETPLACE_SEARCH_CATEGORIES = [
  { label: "New Arrival", href: "/shop?sort=new" },
  { label: "Women", href: "/categories/dresses" },
  { label: "Men", href: "/shop" },
  { label: "Shoes", href: "/categories/shoes" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Beauty", href: "/shop" },
  { label: "Bags", href: "/categories/bags" }
] as const;

function matchesTokens(value: string, tokens: string[]) {
  const haystack = value.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function searchProducts(index: SearchProductIndex[], query: string) {
  const tokens = tokenizeSearchQuery(query);

  if (tokens.length === 0) {
    return [];
  }

  return index.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.brand,
      product.sku,
      ...product.colors,
      ...product.tags
    ]
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
}

export function searchCategories(index: SearchProductIndex[], query: string) {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  const categories = new Set<string>();
  index.forEach((product) => {
    if (matchesTokens(product.category, tokens)) {
      categories.add(product.category);
    }
  });

  return Array.from(categories).slice(0, 6);
}

export function searchBrands(index: SearchProductIndex[], query: string) {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  const brands = new Set<string>();
  index.forEach((product) => {
    if (matchesTokens(product.brand, tokens)) {
      brands.add(product.brand);
    }
  });

  return Array.from(brands).slice(0, 6);
}

export function searchStores(query: string) {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  return PLATFORM_STORES.filter(
    (store) =>
      matchesTokens(store.label, tokens) ||
      matchesTokens(store.description, tokens) ||
      matchesTokens(store.monogram, tokens)
  ).slice(0, 6);
}

export function getPopularSearchTerms(index: SearchProductIndex[]) {
  const terms = new Set<string>(TRENDING_SEARCH_TERMS);

  index
    .filter((product) => product.tags.includes("best seller") || product.tags.includes("new arrival"))
    .slice(0, 4)
    .forEach((product) => {
      terms.add(product.category);
    });

  return Array.from(terms).slice(0, 6);
}

export function getTrendingSearchTerms() {
  return [...TRENDING_SEARCH_TERMS];
}

export function getRecommendedKeywords() {
  return [...RECOMMENDED_KEYWORDS];
}

export function getMarketplaceSearchCategories() {
  return [...MARKETPLACE_SEARCH_CATEGORIES];
}

export function getPopularCategories(index: SearchProductIndex[]) {
  const counts = new Map<string, number>();

  index.forEach((product) => {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([category]) => category)
    .slice(0, 6);
}

export function getPopularStores() {
  return PLATFORM_STORES.filter((store) => store.id !== "beauty").slice(0, 6);
}
