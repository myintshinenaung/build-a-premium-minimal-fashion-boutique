import { cache } from "react";
import { bannerService } from "@/lib/services";
import { mapAdminBannerToStorefrontBanner } from "@/lib/storefront/map-banners";
import type { StorefrontBanner, StorefrontBannerPlacement } from "@/types/storefront";

export const getStorefrontBanners = cache(async (): Promise<StorefrontBanner[]> => {
  const banners = await bannerService.getBanners();

  return banners
    .filter((banner) => banner.status === "Published")
    .map(mapAdminBannerToStorefrontBanner);
});

export async function getStorefrontBannerByPlacement(placement: StorefrontBannerPlacement) {
  const banners = await getStorefrontBanners();
  return banners.find((banner) => banner.placement === placement) ?? null;
}
