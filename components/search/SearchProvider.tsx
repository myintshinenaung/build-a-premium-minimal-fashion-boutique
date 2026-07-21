"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SearchProductIndex } from "@/types/search";
import { getPopularSearchTerms } from "@/lib/storefront/search";

type SearchContextValue = {
  index: SearchProductIndex[];
  popularTerms: string[];
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ index, children }: { index: SearchProductIndex[]; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const popularTerms = useMemo(() => getPopularSearchTerms(index), [index]);

  const value = useMemo(
    () => ({
      index,
      popularTerms,
      isOpen,
      openSearch: () => setIsOpen(true),
      closeSearch: () => setIsOpen(false),
      toggleSearch: () => setIsOpen((current) => !current)
    }),
    [index, isOpen, popularTerms]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }

  return context;
}
