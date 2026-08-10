/** NOVORA platform identity shown in the marketplace header. */
export const PLATFORM_NAME = "NOVORA";

/** Customer-facing store identity for the Daily Outfit storefront on this domain. */
export const STOREFRONT_DISPLAY_NAME = "Daily Outfit";

/** Active platform store on this domain. */
export const ACTIVE_PLATFORM_STORE_ID = "daily-outfit";

export type PlatformStore = {
  id: string;
  label: string;
  description: string;
  monogram: string;
  href: string | null;
};

/** Platform stores on the NOVORA marketplace. */
export const PLATFORM_STORES: PlatformStore[] = [
  {
    id: "daily-outfit",
    label: "Daily Outfit",
    description: "Premium Fashion",
    monogram: "DO",
    href: "/stores/daily-outfit"
  },
  {
    id: "myanmar-vibe",
    label: "Myanmar Vibe Fashion",
    description: "Modern Myanmar Style",
    monogram: "MV",
    href: null
  },
  {
    id: "street-wear",
    label: "Street Wear",
    description: "Urban Street Style",
    monogram: "SW",
    href: null
  },
  {
    id: "luxury-boutique",
    label: "Luxury Boutique",
    description: "Luxury Fashion",
    monogram: "LB",
    href: null
  },
  {
    id: "sports-wear",
    label: "Sports Wear",
    description: "Active Lifestyle",
    monogram: "SP",
    href: null
  },
  {
    id: "kids-fashion",
    label: "Kids Fashion",
    description: "Kids & Family",
    monogram: "KF",
    href: null
  },
  {
    id: "beauty",
    label: "Beauty",
    description: "Beauty & Wellness",
    monogram: "BE",
    href: null
  }
];

export const DEFAULT_PRODUCT_IMAGE = "/images/hero-boutique.png";
