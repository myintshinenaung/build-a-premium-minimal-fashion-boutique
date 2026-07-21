"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { LOCALE_STORAGE_KEY, parseLocale, writeLocaleCookie } from "@/lib/i18n/locale-cookie";

type LocaleState = {
  locale: Locale;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      hasHydrated: false,
      setLocale: (locale) => {
        writeLocaleCookie(locale);
        set({ locale });
      },
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: LOCALE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.locale) {
          writeLocaleCookie(parseLocale(state.locale));
        }
      }
    }
  )
);
