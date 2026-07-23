"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Translator } from "@/features/i18n/application/get-translator";
import { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";

const TranslatorContext = createContext<Translator | null>(null);

export function TranslatorProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);
  const translator = useMemo(() => createTranslator(locale), [locale]);

  return <TranslatorContext.Provider value={translator}>{children}</TranslatorContext.Provider>;
}

export function useTranslator() {
  const context = useContext(TranslatorContext);

  if (!context) {
    throw new Error("useTranslator must be used within TranslatorProvider");
  }

  return context;
}
