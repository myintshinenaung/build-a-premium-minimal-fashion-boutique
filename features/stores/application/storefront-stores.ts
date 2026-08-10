import { cache } from "react";
import { buildStoreHref } from "@/features/stores/domain/store-schemas";
import { storeService } from "@/features/stores/application/store-service";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import type { FeaturedStoreCard } from "@/features/homepage/domain/featured-stores";
import type { PlatformCategory, Store } from "@/types/store";

function toFeaturedCard(store: Store): FeaturedStoreCard {
  return {
    id: store.id,
    label: store.name,
    description: store.description,
    monogram: store.monogram || store.name.slice(0, 2).toUpperCase(),
    href: buildStoreHref(store),
    isActive: store.id === ACTIVE_PLATFORM_STORE_ID
  };
}

function legacyFeaturedCards(): FeaturedStoreCard[] {
  return PLATFORM_STORES.map((store) => ({
    id: store.id,
    label: store.label,
    description: store.description,
    monogram: store.monogram,
    href: store.href ? `/stores/${store.id}` : null,
    isActive: store.id === ACTIVE_PLATFORM_STORE_ID
  }));
}

export const getStores = cache(async () => storeService.list());

export const getActiveStores = cache(async () => storeService.listActive());

export const getPlatformCategories = cache(async () => {
  const categories = await storeService.listPlatformCategories();
  return categories.filter((category) => category.status === "active");
});

export const getStoreBySlug = cache(async (slug: string) => storeService.getBySlug(slug));

export const getStoresByPlatformCategorySlug = cache(async (slug: string) =>
  storeService.listByPlatformCategorySlug(slug)
);

export async function getFeaturedStoreCards(): Promise<FeaturedStoreCard[]> {
  const stores = await getStores();
  if (stores.length === 0) {
    return legacyFeaturedCards();
  }

  return stores
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(toFeaturedCard);
}

export async function getStoreNavigationItems(): Promise<FeaturedStoreCard[]> {
  return getFeaturedStoreCards();
}

export type { PlatformCategory, Store };
