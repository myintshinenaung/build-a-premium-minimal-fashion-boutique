import { cache } from "react";
import {
  assignUniqueProductSlugs,
  mapAdminCategoryToCategory,
  mapAdminProductToProduct
} from "@/features/catalog/domain/map-catalog";
import { mapAdminCategoryToRailItem, type CategoryRailItem } from "@/features/catalog/domain/map-category-rail";
import { categoryService } from "@/features/catalog/application/category-service";
import { productService } from "@/features/catalog/application/product-service";
import { runRecommendationEngine } from "@/features/recommendations/domain/recommendation-engine";
import { recommendationRepository } from "@/features/recommendations/infrastructure/recommendation-repository";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { timedQuery } from "@/features/performance/infrastructure/metrics-store";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import type { Category, Product } from "@/types/product";

type Catalog = {
  categories: Category[];
  products: Product[];
};

async function loadCatalogForStore(storeId: string): Promise<Catalog> {
  const [adminCategories, adminProducts] = await timedQuery(`catalog.load.${storeId}`, () =>
    Promise.all([
      categoryService.getCategories(),
      productService.getProducts({ status: "Published", storeId })
    ])
  );

  const publishedCategories = adminCategories
    .filter((category) => category.status === "Published")
    .filter((category) => (category.storeId ?? ACTIVE_PLATFORM_STORE_ID) === storeId);
  const categoryById = new Map(publishedCategories.map((category) => [category.id, category]));

  const products = assignUniqueProductSlugs(
    adminProducts
      .filter((product) => product.status === "Published")
      .filter((product) => (product.storeId ?? ACTIVE_PLATFORM_STORE_ID) === storeId)
      .filter((product) => categoryById.has(product.categoryId))
      .map((product) => mapAdminProductToProduct(product, categoryById.get(product.categoryId)!.name))
  );

  return {
    categories: publishedCategories.map(mapAdminCategoryToCategory),
    products
  };
}

const loadDefaultCatalogData = createCachedLoader(
  "storefront-catalog",
  [CACHE_TAGS.catalog, CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.homepage],
  CACHE_TTLS.catalog,
  async () => loadCatalogForStore(ACTIVE_PLATFORM_STORE_ID)
);

const getDefaultCatalog = cache(loadDefaultCatalogData);

export async function getCatalogByStoreId(storeId: string) {
  if (storeId === ACTIVE_PLATFORM_STORE_ID) {
    return getDefaultCatalog();
  }

  return loadCatalogForStore(storeId);
}

export async function getCategories(storeId = ACTIVE_PLATFORM_STORE_ID) {
  const { categories } = await getCatalogByStoreId(storeId);
  return categories;
}

const loadCategoryRailData = createCachedLoader(
  "storefront-category-rail",
  [CACHE_TAGS.categories, CACHE_TAGS.homepage],
  CACHE_TTLS.catalog,
  async (): Promise<CategoryRailItem[]> => {
    const adminCategories = await categoryService.getCategories();

    return adminCategories
      .filter((category) => category.status === "Published")
      .filter((category) => (category.storeId ?? ACTIVE_PLATFORM_STORE_ID) === ACTIVE_PLATFORM_STORE_ID)
      .filter((category) => category.image.trim().length > 0)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(mapAdminCategoryToRailItem);
  }
);

export const getCategoryRailItems = cache(loadCategoryRailData);

export async function getProducts(storeId = ACTIVE_PLATFORM_STORE_ID) {
  const { products } = await getCatalogByStoreId(storeId);
  return products;
}

export async function getProductBySlug(slug: string, storeId = ACTIVE_PLATFORM_STORE_ID) {
  const products = await getProducts(storeId);
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string, storeId = ACTIVE_PLATFORM_STORE_ID) {
  const categories = await getCategories(storeId);
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategory(categoryName: string, storeId = ACTIVE_PLATFORM_STORE_ID) {
  const products = await getProducts(storeId);
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

export async function getProductSlugs(storeId = ACTIVE_PLATFORM_STORE_ID) {
  const products = await getProducts(storeId);
  return products.map((product) => product.slug);
}

export async function getCategorySlugs(storeId = ACTIVE_PLATFORM_STORE_ID) {
  const categories = await getCategories(storeId);
  return categories.map((category) => category.slug);
}

export const revalidate = 300;
