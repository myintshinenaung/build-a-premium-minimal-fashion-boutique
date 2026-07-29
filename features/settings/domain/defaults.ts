import type { StorefrontSettings } from "@/types/storefront";

export const defaultStorefrontSettings: StorefrontSettings = {
  storeName: "Daily Outfit",
  logo: "/app/icon.svg",
  storeDescription: "Curated fashion for modern wardrobes across the NOVORA marketplace.",
  currency: "MMK",
  timezone: "Asia/Yangon",
  email: "hello@dailyoutfit.example",
  phone: "+95 9 421 000 112",
  address: "Junction City\nYangon",
  googleMap: "https://www.google.com/maps?q=Junction+City+Yangon",
  facebook: "https://facebook.com/dailyoutfit",
  messenger: "https://m.me/dailyoutfit",
  viber: "viber://chat?number=%2B959421000112",
  telegram: "https://t.me/dailyoutfit",
  tiktok: "https://tiktok.com/@dailyoutfit",
  instagram: "https://instagram.com/dailyoutfit",
  hero: {
    title: "",
    subtitle: "Curated fashion for modern wardrobes across the NOVORA marketplace.",
    marketingHeadline: "New season essentials",
    ctaLabel: "Shop Now",
    secondaryCtaLabel: "Browse Categories",
    primaryCtaHref: "/shop",
    secondaryCtaHref: "/categories",
    backgroundImage: "/images/hero-boutique.png",
    imageAlt: "Daily Outfit fashion editorial"
  }
};

export const defaultAdminHeroSettings = {
  heroTitleEn: "",
  heroTitleMy: "",
  heroSubtitleEn: "Curated fashion for modern wardrobes across the NOVORA marketplace.",
  heroSubtitleMy: "NOVORA marketplace တွင် ခေတ်မီဝတ်စုံများအတွက် curated fashion။",
  heroMarketingHeadlineEn: "New season essentials",
  heroMarketingHeadlineMy: "New season essentials",
  heroCtaLabelEn: "Shop Now",
  heroCtaLabelMy: "Shop Now",
  heroSecondaryCtaLabelEn: "Browse Categories",
  heroSecondaryCtaLabelMy: "အမျိုးအစားများ ကြည့်ရန်",
  heroPrimaryCtaHref: "/shop",
  heroSecondaryCtaHref: "/categories",
  heroBackgroundImage: "/images/hero-boutique.png"
};
