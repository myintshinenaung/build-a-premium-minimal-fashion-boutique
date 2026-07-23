"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultLocale, type Locale } from "@/features/i18n/domain/config";
import { LOCALE_STORAGE_KEY, parseLocale, writeLocaleCookie } from "@/features/i18n/infrastructure/locale-cookie";

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
