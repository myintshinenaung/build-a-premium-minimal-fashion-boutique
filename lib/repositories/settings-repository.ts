import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, SettingsRow } from "@/lib/supabase/types";
import { defaultAdminHeroSettings } from "@/lib/storefront/defaults";
import type { StoreSettings } from "@/types/admin";

type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];

export type SettingsUpdateInput = Partial<StoreSettings>;

const defaultSettings: StoreSettings = {
  storeName: "",
  logo: "",
  storeDescription: "",
  facebook: "",
  messenger: "",
  viber: "",
  telegram: "",
  tiktok: "",
  instagram: "",
  email: "",
  phone: "",
  address: "",
  googleMap: "",
  currency: "MMK",
  timezone: "Asia/Yangon",
  ...defaultAdminHeroSettings
};

export const settingsRepository = {
  async get() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("settings").select("*").eq("id", "store").maybeSingle();

      if (error) {
        throw error;
      }

      return data ? settingsFromRow(data) : defaultSettings;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return defaultSettings;
      }

      throw createRepositoryError("Unable to load settings", error);
    }
  },

  async update(input: SettingsUpdateInput) {
    const currentSettings = await this.get();
    const nextSettings = {
      ...currentSettings,
      ...input
    };
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .upsert(settingsToInsert(nextSettings), { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw createRepositoryError("Unable to update settings", error);
    }

    return settingsFromRow(data);
  }
};

function settingsFromRow(row: SettingsRow): StoreSettings {
  return {
    storeName: row.store_name,
    logo: row.logo,
    storeDescription: row.store_description,
    facebook: row.facebook,
    messenger: row.messenger,
    viber: row.viber,
    telegram: row.telegram,
    tiktok: row.tiktok,
    instagram: row.instagram,
    email: row.email,
    phone: row.phone,
    address: row.address,
    googleMap: row.google_map,
    currency: row.currency,
    timezone: row.timezone,
    heroTitleEn: row.hero_title_en ?? defaultAdminHeroSettings.heroTitleEn,
    heroTitleMy: row.hero_title_my ?? defaultAdminHeroSettings.heroTitleMy,
    heroSubtitleEn: row.hero_subtitle_en || defaultAdminHeroSettings.heroSubtitleEn,
    heroSubtitleMy: row.hero_subtitle_my || defaultAdminHeroSettings.heroSubtitleMy,
    heroMarketingHeadlineEn: row.hero_marketing_headline_en || defaultAdminHeroSettings.heroMarketingHeadlineEn,
    heroMarketingHeadlineMy: row.hero_marketing_headline_my || defaultAdminHeroSettings.heroMarketingHeadlineMy,
    heroCtaLabelEn: row.hero_cta_label_en || defaultAdminHeroSettings.heroCtaLabelEn,
    heroCtaLabelMy: row.hero_cta_label_my || defaultAdminHeroSettings.heroCtaLabelMy,
    heroSecondaryCtaLabelEn: row.hero_secondary_cta_label_en || defaultAdminHeroSettings.heroSecondaryCtaLabelEn,
    heroSecondaryCtaLabelMy: row.hero_secondary_cta_label_my || defaultAdminHeroSettings.heroSecondaryCtaLabelMy,
    heroPrimaryCtaHref: row.hero_primary_cta_href || defaultAdminHeroSettings.heroPrimaryCtaHref,
    heroSecondaryCtaHref: row.hero_secondary_cta_href || defaultAdminHeroSettings.heroSecondaryCtaHref,
    heroBackgroundImage: row.hero_background_image || defaultAdminHeroSettings.heroBackgroundImage
  };
}

function settingsToInsert(settings: StoreSettings): SettingsInsert {
  return {
    id: "store",
    store_name: settings.storeName,
    logo: settings.logo,
    store_description: settings.storeDescription,
    facebook: settings.facebook,
    messenger: settings.messenger,
    viber: settings.viber,
    telegram: settings.telegram,
    tiktok: settings.tiktok,
    instagram: settings.instagram,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    google_map: settings.googleMap,
    currency: settings.currency,
    timezone: settings.timezone,
    hero_title_en: settings.heroTitleEn,
    hero_title_my: settings.heroTitleMy,
    hero_subtitle_en: settings.heroSubtitleEn,
    hero_subtitle_my: settings.heroSubtitleMy,
    hero_marketing_headline_en: settings.heroMarketingHeadlineEn,
    hero_marketing_headline_my: settings.heroMarketingHeadlineMy,
    hero_cta_label_en: settings.heroCtaLabelEn,
    hero_cta_label_my: settings.heroCtaLabelMy,
    hero_secondary_cta_label_en: settings.heroSecondaryCtaLabelEn,
    hero_secondary_cta_label_my: settings.heroSecondaryCtaLabelMy,
    hero_primary_cta_href: settings.heroPrimaryCtaHref,
    hero_secondary_cta_href: settings.heroSecondaryCtaHref,
    hero_background_image: settings.heroBackgroundImage,
    updated_at: currentDateStamp()
  };
}

function currentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
