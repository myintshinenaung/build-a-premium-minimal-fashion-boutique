export type StorefrontHero = {
  title: string;
  subtitle: string;
  marketingHeadline: string;
  ctaLabel: string;
  secondaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaHref: string;
  backgroundImage: string;
  imageAlt: string;
};

export type StorefrontSettings = {
  storeName: string;
  logo: string;
  storeDescription: string;
  currency: string;
  timezone: string;
  email: string;
  phone: string;
  address: string;
  googleMap: string;
  facebook: string;
  messenger: string;
  viber: string;
  telegram: string;
  tiktok: string;
  instagram: string;
  hero: StorefrontHero;
};

export type StorefrontContactLink = {
  id: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
};

export type StorefrontBannerPlacement = "Homepage Hero" | "New Collection" | "Announcement";

export type StorefrontBanner = {
  id: string;
  placement: StorefrontBannerPlacement;
  image: string;
  imageAlt: string;
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
};
