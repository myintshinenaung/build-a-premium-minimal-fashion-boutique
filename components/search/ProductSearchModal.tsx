"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { useSearch } from "@/components/search/SearchProvider";
import { useTranslator } from "@/lib/i18n/use-translator";
import { clearRecentSearches, readRecentSearches, writeRecentSearch } from "@/lib/storefront/search-history";
import { searchProducts } from "@/lib/storefront/search";
import { cn, formatPrice } from "@/lib/utils";

export function ProductSearchModal() {
  const { t } = useTranslator();
  const { index, popularTerms, isOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchProducts(index, query), [index, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRecentSearches(readRecentSearches());
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, isOpen]);

  function handleSelectTerm(term: string) {
    setQuery(term);
    writeRecentSearch(term);
    setRecentSearches(readRecentSearches());
  }

  function handleResultClick(term: string) {
    writeRecentSearch(term);
    closeSearch();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button type="button" aria-label={t("common.close")} onClick={closeSearch} className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-sm" />

      <div className="fixed inset-x-4 top-4 z-[71] mx-auto max-w-2xl rounded-[2px] border border-line bg-white shadow-soft md:inset-x-auto md:top-16">
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <Search size={18} strokeWidth={1.7} className="text-stone" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone"
            aria-label={t("search.title")}
          />
          <span className="hidden rounded border border-line px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-stone md:inline">
            {t("search.shortcutHint")}
          </span>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={closeSearch}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-4 py-4">
          {query.trim() ? (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-stone">{t("search.resultCount", { count: results.length })}</p>
              {results.length === 0 ? (
                <p className="mt-6 text-sm text-stone">{t("search.noResults")}</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {results.slice(0, 8).map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => handleResultClick(product.name)}
                        className="flex items-center gap-4 py-4 transition-colors hover:bg-mist/60"
                      >
                        <BoutiqueImage src={product.image} alt={product.name} className="h-16 w-14 shrink-0 rounded-[2px]" sizes="56px" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                          <p className="mt-1 text-xs text-stone">{product.category}</p>
                        </div>
                        <p className="text-sm text-ink">{formatPrice(product.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {recentSearches.length > 0 ? (
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">{t("search.recent")}</p>
                    <button type="button" onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-stone underline underline-offset-4">
                      {t("search.clearRecent")}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSelectTerm(term)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">{t("search.popular")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectTerm(term)}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function SearchKeyboardShortcut() {
  const { openSearch } = useSearch();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  return null;
}
