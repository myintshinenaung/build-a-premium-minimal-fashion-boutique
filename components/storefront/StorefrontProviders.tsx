"use client";

import type { ReactNode } from "react";
import {
  DocumentLang,
  LocaleProvider,
  TranslatorProvider,
  type Locale
} from "@/features/i18n/client";
import { ProductSearchModal, SearchKeyboardShortcut } from "@/components/search/ProductSearchModal";
import { SearchProvider } from "@/components/search/SearchProvider";
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
