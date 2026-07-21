import type { Locale } from "@/lib/i18n/config";

/**
 * Resolve localized CMS copy once banner tables support per-locale fields.
 * Until then, storefront banners use the single admin-managed string.
 */
export function resolveCmsContent(
  baseValue: string,
  localizedValues: Partial<Record<Locale, string>> | undefined,
  locale: Locale
) {
  const localized = localizedValues?.[locale]?.trim();

  if (localized) {
    return localized;
  }

  return baseValue.trim();
}
