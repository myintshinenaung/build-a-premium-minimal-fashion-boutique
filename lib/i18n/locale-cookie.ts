import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export const LOCALE_COOKIE = "storefront-locale";
export const LOCALE_STORAGE_KEY = "storefront-locale";

export function parseLocale(value?: string | null): Locale {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
