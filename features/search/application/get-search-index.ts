import { getProducts } from "@/features/catalog/server";
import type { Product } from "@/types/product";
import type { SearchProductIndex } from "@/types/search";

export function productToSearchIndex(product: Product): SearchProductIndex {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    brand: product.brand,
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
