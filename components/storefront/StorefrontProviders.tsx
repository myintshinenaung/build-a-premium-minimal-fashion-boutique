"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";
import { ProductSearchModal, SearchKeyboardShortcut } from "@/components/search/ProductSearchModal";
import { SearchProvider } from "@/components/search/SearchProvider";
import type { Locale } from "@/lib/i18n/config";
import { TranslatorProvider } from "@/lib/i18n/use-translator";
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
