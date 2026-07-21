import type { AdminBanner } from "@/types/admin";
import type { StorefrontBanner } from "@/types/storefront";

const defaultBannerImage = "/images/hero-boutique.png";

export function mapAdminBannerToStorefrontBanner(banner: AdminBanner): StorefrontBanner {
  return {
    id: banner.id,
    placement: banner.placement,
    image: banner.image || defaultBannerImage,
    imageAlt: banner.title.trim() || banner.headline.trim() || "Campaign banner",
    eyebrow: banner.eyebrow.trim(),
    headline: banner.headline.trim(),
    ctaLabel: banner.ctaLabel.trim(),
    ctaHref: banner.ctaHref.trim() || "/shop"
  };
}
