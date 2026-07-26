import { cache } from "react";
import { getRequestLocale } from "@/features/i18n/server";
import { mapStoreSettingsToStorefront } from "@/features/settings/domain/map-settings";
import { settingsService } from "@/features/settings/application/settings-service";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import type { StorefrontSettings } from "@/types/storefront";

const loadStoreSettingsData = createCachedLoader(
  "store-settings",
  [CACHE_TAGS.settings, CACHE_TAGS.homepage],
  CACHE_TTLS.settings,
  async (): Promise<StorefrontSettings> => {
    const [settings, locale] = await Promise.all([settingsService.getSettings(), getRequestLocale()]);
    return mapStoreSettingsToStorefront(settings, locale);
  }
);

export const getStoreSettings = cache(loadStoreSettingsData);
