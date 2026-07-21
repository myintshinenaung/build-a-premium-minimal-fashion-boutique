import { cache } from "react";
import { getRequestLocale } from "@/lib/i18n/server-locale";
import { settingsService } from "@/lib/services";
import { mapStoreSettingsToStorefront } from "@/lib/storefront/map-settings";
import type { StorefrontSettings } from "@/types/storefront";

export const getStoreSettings = cache(async (): Promise<StorefrontSettings> => {
  const [settings, locale] = await Promise.all([settingsService.getSettings(), getRequestLocale()]);
  return mapStoreSettingsToStorefront(settings, locale);
});
