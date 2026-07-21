import { defaultAdminHeroSettings, defaultStorefrontSettings } from "@/lib/storefront/defaults";
import { resolveCmsContent } from "@/lib/i18n/cms-content";
import type { Locale } from "@/lib/i18n/config";
import type { StoreSettings } from "@/types/admin";
import type { StorefrontHero, StorefrontSettings } from "@/types/storefront";

function withFallback(value: string, fallback: string) {
  return value.trim() || fallback;
}

function mapHeroSettings(settings: StoreSettings, locale: Locale): StorefrontHero {
  const defaults = defaultStorefrontSettings.hero;

  return {
    title: resolveCmsContent(
      settings.heroTitleEn,
      { en: settings.heroTitleEn, my: settings.heroTitleMy },
      locale
    ),
    subtitle: resolveCmsContent(
      settings.heroSubtitleEn,
      { en: settings.heroSubtitleEn, my: settings.heroSubtitleMy },
      locale
    ),
    marketingHeadline: resolveCmsContent(
      settings.heroMarketingHeadlineEn,
      { en: settings.heroMarketingHeadlineEn, my: settings.heroMarketingHeadlineMy },
      locale
    ),
    ctaLabel: resolveCmsContent(
      settings.heroCtaLabelEn,
      { en: settings.heroCtaLabelEn, my: settings.heroCtaLabelMy },
      locale
    ),
    secondaryCtaLabel: resolveCmsContent(
      settings.heroSecondaryCtaLabelEn,
      { en: settings.heroSecondaryCtaLabelEn, my: settings.heroSecondaryCtaLabelMy },
      locale
    ),
    primaryCtaHref: withFallback(settings.heroPrimaryCtaHref, defaults.primaryCtaHref),
    secondaryCtaHref: withFallback(settings.heroSecondaryCtaHref, defaults.secondaryCtaHref),
    backgroundImage: withFallback(settings.heroBackgroundImage, defaults.backgroundImage),
    imageAlt: `${withFallback(settings.storeName, defaultStorefrontSettings.storeName)} editorial`
  };
}

export function mapStoreSettingsToStorefront(settings: StoreSettings, locale: Locale = "my"): StorefrontSettings {
  return {
    storeName: withFallback(settings.storeName, defaultStorefrontSettings.storeName),
    logo: withFallback(settings.logo, defaultStorefrontSettings.logo),
    storeDescription: withFallback(settings.storeDescription, defaultStorefrontSettings.storeDescription),
    currency: withFallback(settings.currency, defaultStorefrontSettings.currency),
    timezone: withFallback(settings.timezone, defaultStorefrontSettings.timezone),
    email: withFallback(settings.email, defaultStorefrontSettings.email),
    phone: withFallback(settings.phone, defaultStorefrontSettings.phone),
    address: withFallback(settings.address, defaultStorefrontSettings.address),
    googleMap: withFallback(settings.googleMap, defaultStorefrontSettings.googleMap),
    facebook: settings.facebook.trim(),
    messenger: settings.messenger.trim(),
    viber: settings.viber.trim(),
    telegram: settings.telegram.trim(),
    tiktok: settings.tiktok.trim(),
    instagram: settings.instagram.trim(),
    hero: mapHeroSettings(settings, locale)
  };
}
