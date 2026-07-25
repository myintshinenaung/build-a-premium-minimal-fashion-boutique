import type { StorefrontSettings } from "@/types/storefront";

export const defaultStorefrontSettings: StorefrontSettings = {
  storeName: "Atelier Lune",
  logo: "/app/icon.svg",
  storeDescription: "Premium minimal pieces for a quiet, edited wardrobe. Designed around proportion, texture, and daily ease.",
  currency: "MMK",
  timezone: "Asia/Yangon",
  email: "hello@atelierlune.example",
  phone: "+1 555 014 6771",
  address: "24 Garosu-gil\nGangnam-gu, Seoul",
  googleMap: "https://www.google.com/maps?q=Garosu-gil%2C%20Gangnam-gu%2C%20Seoul",
  facebook: "https://facebook.com/atelierlune",
  messenger: "https://m.me/atelierlune",
  viber: "viber://chat?number=%2B15550146771",
  telegram: "",
  tiktok: "",
  instagram: "https://instagram.com/atelierlune",
  hero: {
    title: "",
    subtitle: "Premium minimal pieces for a quiet, edited wardrobe.",
    marketingHeadline: "Spring collection",
    ctaLabel: "Shop Collection",
    secondaryCtaLabel: "Browse Categories",
    primaryCtaHref: "/shop",
    secondaryCtaHref: "/categories",
    backgroundImage: "/images/hero-boutique.png",
    imageAlt: "Minimal fashion editorial"
  }
};

export const defaultAdminHeroSettings = {
  heroTitleEn: "",
  heroTitleMy: "",
  heroSubtitleEn: "Premium minimal pieces for a quiet, edited wardrobe.",
  heroSubtitleMy: "တိတ်ဆိတ်သော wardrobe အတွက် premium minimal ပစ္စည်းများ။",
  heroMarketingHeadlineEn: "Spring collection",
  heroMarketingHeadlineMy: "Spring collection",
  heroCtaLabelEn: "Shop Collection",
  heroCtaLabelMy: "Shop Collection",
  heroSecondaryCtaLabelEn: "Browse Categories",
  heroSecondaryCtaLabelMy: "အမျိုးအစားများ ကြည့်ရန်",
  heroPrimaryCtaHref: "/shop",
  heroSecondaryCtaHref: "/categories",
  heroBackgroundImage: "/images/hero-boutique.png"
};
