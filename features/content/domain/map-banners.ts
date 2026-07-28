import type { AdminBanner } from "@/types/admin";
import type { StorefrontBanner } from "@/types/storefront";

export function mapAdminBannerToStorefrontBanner(banner: AdminBanner): StorefrontBanner {
  const image = banner.image.trim();
  const mobileImage = banner.mobileImage.trim() || image;

  return {
    id: banner.id,
    placement: banner.placement,
    image,
    imageAlt: banner.headline.trim() || banner.title.trim(),
    eyebrow: banner.eyebrow.trim(),
    headline: banner.headline.trim(),
    ctaLabel: banner.ctaLabel.trim(),
    ctaHref: banner.ctaHref.trim(),
    storeName: banner.storeName.trim(),
    desktopImage: image,
    mobileImage,
    sortOrder: banner.sortOrder,
    active: banner.status === "Published",
    autoplay: true,
    startsAt: banner.startsAt,
    endsAt: banner.endsAt
  };
}
