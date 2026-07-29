"use client";

import { useEffect } from "react";
import type { Locale } from "@/features/i18n/domain/config";
import { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";

export function DocumentLang({ initialLocale }: { initialLocale: Locale }) {
  const locale = useLocaleStore((state) => state.locale);
  const hasHydrated = useLocaleStore((state) => state.hasHydrated);
  const effectiveLocale = hasHydrated ? locale : initialLocale;

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
  }, [effectiveLocale]);

  return null;
}
