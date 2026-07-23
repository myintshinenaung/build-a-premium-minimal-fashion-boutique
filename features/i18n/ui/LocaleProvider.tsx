"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Locale } from "@/features/i18n/domain/config";
import { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const hasHydrated = useLocaleStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && locale !== initialLocale) {
      router.refresh();
    }
  }, [hasHydrated, initialLocale, locale, router]);

  return children;
}

export function useLocaleSwitcher() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    router.refresh();
  }

  return { locale, switchLocale };
}
