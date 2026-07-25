"use client";

import type { ReactNode } from "react";
import {
  DocumentLang,
  LocaleProvider,
  TranslatorProvider,
  type Locale
} from "@/features/i18n/client";
import { ProductSearchModal, SearchKeyboardShortcut, SearchProvider } from "@/features/search/client";
import type { SearchProductIndex } from "@/types/search";

type StorefrontProvidersProps = {
  initialLocale: Locale;
  searchIndex: SearchProductIndex[];
  children: ReactNode;
};

export function StorefrontProviders({ initialLocale, searchIndex, children }: StorefrontProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <TranslatorProvider>
        <SearchProvider index={searchIndex}>
          <DocumentLang />
          {children}
          <ProductSearchModal />
          <SearchKeyboardShortcut />
        </SearchProvider>
      </TranslatorProvider>
    </LocaleProvider>
  );
}
