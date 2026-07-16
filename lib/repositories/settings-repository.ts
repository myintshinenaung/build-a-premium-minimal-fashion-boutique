import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, SettingsRow } from "@/lib/supabase/types";
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
  timezone: "Asia/Yangon"
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
    timezone: row.timezone
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
    updated_at: currentDateStamp()
  };
}

function currentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
