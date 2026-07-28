import { revalidateTag } from "next/cache";
import { INVALIDATION_GROUPS } from "@/features/performance/domain/cache-tags";
import { enqueueCacheRefresh } from "@/features/performance/infrastructure/job-queue";
import type { CacheTag } from "@/types/performance";

export async function invalidateCacheTags(tags: readonly CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  enqueueCacheRefresh([...tags]);
}

export async function invalidateCatalogCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.catalog);
}

export async function invalidateReviewCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.reviews);
}

export async function invalidateInventoryCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.inventory);
}

export async function invalidateAnalyticsCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.analytics);
}

export async function invalidateHomepageCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.homepage);
}

export async function invalidateSettingsCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.settings);
}

export async function invalidateBannerCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.banners);
}

export async function invalidatePromotionCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.promotions);
}

export async function invalidateFeaturedCollectionCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.featuredCollections);
}

export async function invalidateProductRailCache() {
  await invalidateCacheTags(INVALIDATION_GROUPS.productRails);
}

export async function clearAllCaches() {
  const allTags = Array.from(new Set(Object.values(INVALIDATION_GROUPS).flat())) as CacheTag[];
  await invalidateCacheTags(allTags);
}
