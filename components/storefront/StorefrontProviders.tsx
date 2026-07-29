"use client";

import { useEffect, type ReactNode } from "react";
import {
  DocumentLang,
  LocaleProvider,
  TranslatorProvider,
  type Locale
} from "@/features/i18n/client";
import { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";
import { ProductSearchModal, SearchKeyboardShortcut, SearchProvider } from "@/features/search/client";
import type { SearchProductIndex } from "@/types/search";

type StorefrontProvidersProps = {
  initialLocale: Locale;
  searchIndex: SearchProductIndex[];
  children: ReactNode;
};

function LocaleRehydrator() {
  useEffect(() => {
    void useLocaleStore.persist.rehydrate();
  }, []);

  return null;
}

export function StorefrontProviders({ initialLocale, searchIndex, children }: StorefrontProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <TranslatorProvider initialLocale={initialLocale}>
        <LocaleRehydrator />
        <SearchProvider index={searchIndex}>
          <DocumentLang initialLocale={initialLocale} />
          {children}
          <ProductSearchModal />
          <SearchKeyboardShortcut />
        </SearchProvider>
      </TranslatorProvider>
    </LocaleProvider>
  );
}
