import { cache } from "react";
import { getRequestLocale } from "@/features/i18n/server";
import { mapStoreSettingsToStorefront } from "@/features/settings/domain/map-settings";
import { settingsService } from "@/features/settings/application/settings-service";
import type { StorefrontSettings } from "@/types/storefront";

export const getStoreSettings = cache(async (): Promise<StorefrontSettings> => {
  const [settings, locale] = await Promise.all([settingsService.getSettings(), getRequestLocale()]);
  return mapStoreSettingsToStorefront(settings, locale);
});
