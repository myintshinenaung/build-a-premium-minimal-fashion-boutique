import type { SearchProductIndex } from "@/types/search";

export function searchProducts(index: SearchProductIndex[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return index.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.sku,
      ...product.colors,
      ...product.tags
    ]
      .join(" ")
      .toLowerCase();

    return normalized.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export function getPopularSearchTerms(index: SearchProductIndex[]) {
  const terms = new Set<string>();

  index
    .filter((product) => product.tags.includes("best seller") || product.tags.includes("new arrival"))
    .slice(0, 4)
    .forEach((product) => {
      terms.add(product.category);
      terms.add(product.name.split(" ").slice(0, 2).join(" "));
    });

  if (terms.size === 0) {
    index.slice(0, 4).forEach((product) => terms.add(product.category));
  }

  return Array.from(terms).slice(0, 5);
}
