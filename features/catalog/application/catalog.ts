import { cache } from "react";
import {
  assignUniqueProductSlugs,
  mapAdminCategoryToCategory,
  mapAdminProductToProduct
} from "@/features/catalog/domain/map-catalog";
import { categoryService } from "@/features/catalog/application/category-service";
import { productService } from "@/features/catalog/application/product-service";
import { runRecommendationEngine } from "@/features/recommendations/domain/recommendation-engine";
import { recommendationRepository } from "@/features/recommendations/infrastructure/recommendation-repository";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { timedQuery } from "@/features/performance/infrastructure/metrics-store";
import type { Category, Product } from "@/types/product";

type Catalog = {
  categories: Category[];
  products: Product[];
};

const loadCatalogData = createCachedLoader(
  "storefront-catalog",
  [CACHE_TAGS.catalog, CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.homepage],
  CACHE_TTLS.catalog,
  async (): Promise<Catalog> => {
    const [adminCategories, adminProducts] = await timedQuery("catalog.load", () =>
      Promise.all([categoryService.getCategories(), productService.getProducts({ status: "Published" })])
    );

    const publishedCategories = adminCategories.filter((category) => category.status === "Published");
    const categoryById = new Map(publishedCategories.map((category) => [category.id, category]));

    const products = assignUniqueProductSlugs(
      adminProducts
        .filter((product) => product.status === "Published" && categoryById.has(product.categoryId))
        .map((product) => mapAdminProductToProduct(product, categoryById.get(product.categoryId)!.name))
    );

    return {
      categories: publishedCategories.map(mapAdminCategoryToCategory),
      products
    };
  }
);

const getCatalog = cache(loadCatalogData);

export async function getCategories() {
  const { categories } = await getCatalog();
  return categories;
}

export async function getProducts() {
  const { products } = await getCatalog();
  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategory(categoryName: string) {
  const products = await getProducts();
  return products.filter((product) => product.category === categoryName);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const catalog = await recommendationRepository.loadRecommendationCatalog();
  return runRecommendationEngine(catalog, "related", { productId: product.id, limit });
}

export async function getBestSellers(limit = 4) {
  const catalog = await recommendationRepository.loadRecommendationCatalog();
  return runRecommendationEngine(catalog, "best-sellers", { limit });
}

export async function getNewArrivals(limit = 4) {
  const catalog = await recommendationRepository.loadRecommendationCatalog();
  return runRecommendationEngine(catalog, "new-arrivals", { limit });
}

export async function getProductSlugs() {
  const products = await getProducts();
  return products.map((product) => product.slug);
}

export async function getCategorySlugs() {
  const categories = await getCategories();
  return categories.map((category) => category.slug);
}

export const revalidate = 300;
