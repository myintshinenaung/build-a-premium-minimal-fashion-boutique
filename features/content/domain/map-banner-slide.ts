import type { StorefrontBanner } from "@/types/storefront";

/** Storefront hero slide — fully driven by dashboard banner records. */
export type MarketplaceBannerSlide = {
  id: string;
  title: string;
  subtitle: string;
  headline: string;
  storeName: string;
  buttonLabel: string;
  link: string;
  image: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  sortOrder: number;
  active: boolean;
  autoplay: boolean;
};

export function mapBannerToMarketplaceSlide(banner: StorefrontBanner): MarketplaceBannerSlide {
  const desktopImage = banner.desktopImage.trim() || banner.image.trim();
  const mobileImage = banner.mobileImage.trim() || desktopImage;

  return {
    id: banner.id,
    title: banner.headline.trim(),
    subtitle: banner.eyebrow.trim(),
    headline: banner.headline.trim(),
    storeName: banner.storeName.trim(),
    buttonLabel: banner.ctaLabel.trim(),
    link: banner.ctaHref.trim(),
    image: desktopImage,
    desktopImage,
    mobileImage,
    imageAlt: banner.imageAlt.trim() || banner.headline.trim(),
    sortOrder: banner.sortOrder,
    active: banner.active,
    autoplay: banner.autoplay
  };
}
