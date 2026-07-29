"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flame,
  Hash,
  Search,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  X
} from "lucide-react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { useSearch } from "@/features/search/ui/storefront/SearchProvider";
import { useTranslator } from "@/features/i18n/client";
import { clearRecentSearches, readRecentSearches, writeRecentSearch } from "@/features/search/infrastructure/search-history";
import { buildProductSearchPath } from "@/features/search/domain/product-search";
import {
  getMarketplaceSearchCategories,
  getPopularStores,
  getRecommendedKeywords,
  getTrendingSearchTerms,
  searchBrands,
  searchCategories,
  searchProducts,
  searchStores
} from "@/features/search/domain/search-query";
import { getCategoryIcon } from "@/lib/storefront/category-icons";
import type { PlatformStore } from "@/lib/storefront/brand";
import { cn, formatPrice } from "@/lib/utils";

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 shadow-sm">
        {icon}
      </span>
      <h3 className="text-[15px] font-semibold tracking-tight text-novora-ink">{children}</h3>
    </div>
  );
}

function RecentChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-novora-ink shadow-[0_8px_24px_rgba(17,24,39,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,24,39,0.12)] active:scale-[0.98]"
    >
      <Clock3 size={14} className="text-violet-500" strokeWidth={2.2} />
      {label}
    </button>
  );
}

function KeywordChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-100 hover:to-indigo-100 hover:shadow-md active:scale-[0.98]"
    >
      <Hash size={13} strokeWidth={2.2} />
      {label}
    </button>
  );
}

function TrendingRow({
  rank,
  label,
  onClick
}: {
  rank: number;
  label: string;
  onClick: () => void;
}) {
  const rankTone =
    rank === 1
      ? "from-violet-600 to-indigo-600"
      : rank === 2
        ? "from-violet-500 to-indigo-500"
        : rank === 3
          ? "from-slate-700 to-slate-900"
          : "from-slate-500 to-slate-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-[18px] bg-white px-4 py-3.5 text-left shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(17,24,39,0.10)] active:scale-[0.99]"
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm",
          rankTone
        )}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-novora-ink">{label}</span>
      <TrendingUp
        size={16}
        className="shrink-0 text-novora-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-500"
      />
    </button>
  );
}

function StoreCard({ store, onNavigate }: { store: PlatformStore; onNavigate: (label: string) => void }) {
  const content = (
    <>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
        {store.monogram}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-novora-ink">{store.label}</p>
        <p className="mt-0.5 truncate text-sm text-novora-muted">{store.description}</p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-novora-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-500" />
    </>
  );

  const className =
    "group flex items-center gap-4 rounded-[18px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,24,39,0.12)]";

  if (store.href) {
    return (
      <Link href={store.href} onClick={() => onNavigate(store.label)} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(className, "cursor-default opacity-80")} aria-disabled="true" title="Coming soon">
      {content}
    </div>
  );
}

function CategoryCard({
  label,
  href,
  onNavigate
}: {
  label: string;
  href: string;
  onNavigate: (label: string) => void;
}) {
  const Icon = getCategoryIcon(label);

  return (
    <Link
      href={href}
      onClick={() => onNavigate(label)}
      className="group flex min-w-[108px] flex-col items-center gap-3 rounded-[18px] bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(17,24,39,0.10)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 transition-colors group-hover:from-violet-100 group-hover:to-indigo-100">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <span className="text-center text-sm font-semibold text-novora-ink">{label}</span>
    </Link>
  );
}

function ProductResultCard({
  product,
  onNavigate
}: {
  product: { id: string; slug: string; name: string; brand: string; price: number; image: string };
  onNavigate: (label: string) => void;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={() => onNavigate(product.name)}
      className="group flex items-center gap-4 rounded-[18px] bg-white p-3 shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(17,24,39,0.10)]"
    >
      <MarketplaceImage
        src={product.image}
        alt={product.name}
        className="h-20 w-16 shrink-0 rounded-2xl object-cover"
        sizes="64px"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-novora-ink">{product.name}</p>
        <p className="mt-1 text-xs text-novora-muted">{product.brand}</p>
        <p className="mt-2 text-sm font-bold text-novora-ink">{formatPrice(product.price)}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-novora-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-500" />
    </Link>
  );
}

export function ProductSearchModal() {
  const { t } = useTranslator();
  const { index, isOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const productResults = useMemo(() => searchProducts(index, trimmedQuery), [index, trimmedQuery]);
  const categoryResults = useMemo(() => searchCategories(index, trimmedQuery), [index, trimmedQuery]);
  const brandResults = useMemo(() => searchBrands(index, trimmedQuery), [index, trimmedQuery]);
  const storeResults = useMemo(() => searchStores(trimmedQuery), [trimmedQuery]);

  const marketplaceCategories = useMemo(() => getMarketplaceSearchCategories(), []);
  const popularStores = useMemo(() => getPopularStores(), []);
  const trendingTerms = useMemo(() => getTrendingSearchTerms(), []);
  const recommendedKeywords = useMemo(() => getRecommendedKeywords(), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRecentSearches(readRecentSearches());
    setQuery("");

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, isOpen]);

  function handleSelectTerm(term: string) {
    setQuery(term);
    writeRecentSearch(term);
    setRecentSearches(readRecentSearches());
  }

  function handleNavigate(term: string) {
    writeRecentSearch(term);
    closeSearch();
  }

  const viewAllHref = useMemo(() => {
    if (!hasQuery) {
      return "/shop";
    }

    return buildProductSearchPath({
      q: trimmedQuery,
      category: [],
      brand: [],
      sort: "popularity",
      page: 1,
      pageSize: 8
    });
  }, [hasQuery, trimmedQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={closeSearch}
        className="novora-search-backdrop-enter absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      <div className="relative flex h-full items-start justify-center md:items-center md:p-6">
        <div
          className={cn(
            "novora-search-overlay-enter relative flex h-full w-full flex-col overflow-hidden bg-[#f7f8fb]",
            "md:h-[720px] md:max-h-[90vh] md:w-full md:max-w-[900px] md:rounded-[28px] md:shadow-[0_32px_100px_rgba(0,0,0,0.35)]"
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t("search.title")}
        >
          <div className="shrink-0 bg-white/90 px-4 pb-4 pt-5 backdrop-blur-md md:px-8 md:pt-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeSearch}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-novora-ink transition-colors hover:bg-novora-surface md:hidden"
                aria-label={t("common.close")}
              >
                <ArrowLeft size={20} strokeWidth={1.8} />
              </button>

              <div className="relative flex min-w-0 flex-1 items-center">
                <Search
                  size={22}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-5 text-violet-500"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("search.placeholder")}
                  className="h-14 w-full rounded-[20px] bg-[#f3f4f8] pl-14 pr-24 text-base font-medium text-novora-ink outline-none ring-0 transition-shadow duration-300 placeholder:text-novora-muted focus:bg-white focus:shadow-[0_12px_40px_rgba(99,102,241,0.15)]"
                  aria-label={t("search.title")}
                  autoComplete="off"
                  enterKeyHint="search"
                />
                <span className="pointer-events-none absolute right-4 hidden rounded-xl bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-novora-muted shadow-sm md:inline">
                  {t("search.shortcutHint")}
                </span>
              </div>

              <button
                type="button"
                aria-label={t("common.close")}
                onClick={closeSearch}
                className="hidden h-11 w-11 items-center justify-center rounded-2xl text-novora-ink transition-colors hover:bg-novora-surface md:inline-flex"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-7">
            {hasQuery ? (
              <div className="space-y-8">
                {productResults.length > 0 ? (
                  <section className="novora-search-section-enter">
                    <SectionTitle icon={<Sparkles size={16} strokeWidth={2} />}>{t("search.products")}</SectionTitle>
                    <div className="mt-4 grid gap-3">
                      {productResults.slice(0, 6).map((product) => (
                        <ProductResultCard key={product.id} product={product} onNavigate={handleNavigate} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {storeResults.length > 0 ? (
                  <section className="novora-search-section-enter" style={{ animationDelay: "40ms" }}>
                    <SectionTitle icon={<Store size={16} strokeWidth={2} />}>{t("search.stores")}</SectionTitle>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {storeResults.map((store) => (
                        <StoreCard key={store.id} store={store} onNavigate={handleNavigate} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {categoryResults.length > 0 ? (
                  <section className="novora-search-section-enter" style={{ animationDelay: "80ms" }}>
                    <SectionTitle icon={<Sparkles size={16} strokeWidth={2} />}>{t("search.categories")}</SectionTitle>
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                      {categoryResults.map((category) => (
                        <CategoryCard
                          key={category}
                          label={category}
                          href={`/categories/${category.toLowerCase()}`}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {brandResults.length > 0 ? (
                  <section className="novora-search-section-enter" style={{ animationDelay: "120ms" }}>
                    <SectionTitle icon={<Tag size={16} strokeWidth={2} />}>{t("search.brands")}</SectionTitle>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {brandResults.map((brand) => (
                        <Link
                          key={brand}
                          href={`/shop?brand=${encodeURIComponent(brand)}`}
                          onClick={() => handleNavigate(brand)}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-novora-ink shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(17,24,39,0.10)]"
                        >
                          <Tag size={14} strokeWidth={2} className="text-violet-500" />
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}

                {productResults.length === 0 &&
                categoryResults.length === 0 &&
                brandResults.length === 0 &&
                storeResults.length === 0 ? (
                  <p className="py-16 text-center text-sm text-novora-muted">{t("search.noResults")}</p>
                ) : null}

                {productResults.length > 0 ? (
                  <div className="pt-2">
                    <Link
                      href={viewAllHref}
                      onClick={() => handleNavigate(trimmedQuery)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-colors hover:text-novora-ink"
                    >
                      {t("search.viewAll", { count: productResults.length })}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-9">
                {recentSearches.length > 0 ? (
                  <section className="novora-search-section-enter">
                    <div className="flex items-center justify-between gap-3">
                      <SectionTitle icon={<Clock3 size={16} strokeWidth={2} />}>{t("search.recent")}</SectionTitle>
                      <button
                        type="button"
                        onClick={() => {
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-xs font-semibold text-novora-muted transition-colors hover:text-novora-ink"
                      >
                        {t("search.clearRecent")}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {recentSearches.map((term) => (
                        <RecentChip key={term} label={term} onClick={() => handleSelectTerm(term)} />
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="novora-search-section-enter" style={{ animationDelay: "50ms" }}>
                  <SectionTitle icon={<Flame size={16} strokeWidth={2} />}>{t("search.trending")}</SectionTitle>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {trendingTerms.map((term, index) => (
                      <TrendingRow
                        key={term}
                        rank={index + 1}
                        label={term}
                        onClick={() => handleSelectTerm(term)}
                      />
                    ))}
                  </div>
                </section>

                <section className="novora-search-section-enter" style={{ animationDelay: "100ms" }}>
                  <SectionTitle icon={<Store size={16} strokeWidth={2} />}>{t("search.popularStores")}</SectionTitle>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {popularStores.map((store) => (
                      <StoreCard key={store.id} store={store} onNavigate={handleNavigate} />
                    ))}
                  </div>
                </section>

                <section className="novora-search-section-enter" style={{ animationDelay: "150ms" }}>
                  <SectionTitle icon={<Sparkles size={16} strokeWidth={2} />}>{t("search.popularCategories")}</SectionTitle>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {marketplaceCategories.map((category) => (
                      <CategoryCard
                        key={category.label}
                        label={category.label}
                        href={category.href}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </section>

                <section className="novora-search-section-enter" style={{ animationDelay: "200ms" }}>
                  <SectionTitle icon={<Hash size={16} strokeWidth={2} />}>{t("search.recommendedKeywords")}</SectionTitle>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {recommendedKeywords.map((term) => (
                      <KeywordChip key={term} label={term} onClick={() => handleSelectTerm(term)} />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
