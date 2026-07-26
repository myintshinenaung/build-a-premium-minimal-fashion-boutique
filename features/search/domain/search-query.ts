import type { SearchProductIndex } from "@/types/search";
import { tokenizeSearchQuery } from "@/features/search/domain/product-search";

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
