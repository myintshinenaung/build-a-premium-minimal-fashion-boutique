import { cache } from "react";
import { bannerService } from "@/features/content/application/banner-service";
import { mapAdminBannerToStorefrontBanner } from "@/features/content/domain/map-banners";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import type { StorefrontBanner, StorefrontBannerPlacement } from "@/types/storefront";

const loadStorefrontBannersData = createCachedLoader(
  "storefront-banners",
  [CACHE_TAGS.banners, CACHE_TAGS.homepage],
  CACHE_TTLS.banners,
  async (): Promise<StorefrontBanner[]> => {
    const banners = await bannerService.getBanners();

    return banners
      .filter((banner) => banner.status === "Published")
      .map(mapAdminBannerToStorefrontBanner);
  }
);

export const getStorefrontBanners = cache(loadStorefrontBannersData);

export async function getStorefrontBannerByPlacement(placement: StorefrontBannerPlacement) {
  const banners = await getStorefrontBanners();
  return banners.find((banner) => banner.placement === placement) ?? null;
}
