import { getProducts } from "@/lib/storefront/catalog";
import type { Product } from "@/types/product";
import type { SearchProductIndex } from "@/types/search";

export function productToSearchIndex(product: Product): SearchProductIndex {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    colors: product.colors.map((color) => color.name),
    tags: product.tags,
    sku: product.sku,
    price: product.price,
    image: product.images[0]
  };
}

export async function getSearchIndex() {
  const products = await getProducts();
  return products.map(productToSearchIndex);
}

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
