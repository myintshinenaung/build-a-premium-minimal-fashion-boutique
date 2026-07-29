"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Translator } from "@/features/i18n/application/get-translator";
import type { Locale } from "@/features/i18n/domain/config";
import { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";

const TranslatorContext = createContext<Translator | null>(null);

export function TranslatorProvider({
  initialLocale,
  children
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const hasHydrated = useLocaleStore((state) => state.hasHydrated);
  const effectiveLocale = hasHydrated ? locale : initialLocale;
  const translator = useMemo(() => createTranslator(effectiveLocale), [effectiveLocale]);

  return <TranslatorContext.Provider value={translator}>{children}</TranslatorContext.Provider>;
}

export function useTranslator() {
  const context = useContext(TranslatorContext);

  if (!context) {
    throw new Error("useTranslator must be used within TranslatorProvider");
  }

  return context;
}
