"use client";

import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Category } from "@/types/product";
import type { ProductSearchResponse } from "@/types/search";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslator } from "@/features/i18n/client";
import { buildProductSearchPath, productSearchQueryToSearchParams } from "@/features/search/client";
import type { ProductSearchQuery } from "@/features/search/domain/product-search-schemas";
import { parseProductSearchParams } from "@/features/search/domain/product-search-schemas";
import { ProductGrid } from "./ProductGrid";

type ProductListingProps = {
  categories: Category[];
  initialResults: ProductSearchResponse;
};

const ALL_VALUE = "all";

function createDefaultQuery(initialResults: ProductSearchResponse): ProductSearchQuery {
  return initialResults.query;
}

export function ProductListing({ categories, initialResults }: ProductListingProps) {
  const { t } = useTranslator();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState(initialResults);
  const [query, setQuery] = useState<ProductSearchQuery>(() => createDefaultQuery(initialResults));
  const [searchInput, setSearchInput] = useState(initialResults.query.q);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);

  useEffect(() => {
    setResults(initialResults);
    setQuery(createDefaultQuery(initialResults));
    setSearchInput(initialResults.query.q);
  }, [initialResults]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput === query.q) {
        return;
      }

      updateQuery({ q: searchInput, page: 1 });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query.q, searchInput]);

  function syncUrl(nextQuery: ProductSearchQuery) {
    const nextPath = buildProductSearchPath(nextQuery, pathname || "/shop");
    router.replace(nextPath, { scroll: false });
  }

  async function fetchResults(nextQuery: ProductSearchQuery) {
    const params = productSearchQueryToSearchParams(nextQuery);
    const response = await fetch(`/api/search?${params.toString()}`);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message ?? t("shop.searchError"));
    }

    return (await response.json()) as ProductSearchResponse;
  }

  function updateQuery(partial: Partial<ProductSearchQuery>) {
    const nextQuery: ProductSearchQuery = {
      ...query,
      ...partial
    };

    setQuery(nextQuery);
    syncUrl(nextQuery);
    setErrorMessage(null);

    startTransition(() => {
      void fetchResults(nextQuery)
        .then((payload) => {
          setResults(payload);
          setQuery(payload.query);
          setSearchInput(payload.query.q);
        })
        .catch((error: unknown) => {
          setErrorMessage(error instanceof Error ? error.message : t("shop.searchError"));
        });
    });
  }

  function toggleCategory(category: string) {
    const nextCategories = query.category.includes(category)
      ? query.category.filter((item) => item !== category)
      : [...query.category, category];

    updateQuery({ category: nextCategories, page: 1 });
  }

  function toggleBrand(brand: string) {
    const nextBrands = query.brand.includes(brand)
      ? query.brand.filter((item) => item !== brand)
      : [...query.brand, brand];

    updateQuery({ brand: nextBrands, page: 1 });
  }

  function resetFilters() {
    setSearchInput("");
    updateQuery({
      q: "",
      category: [],
      brand: [],
      minPrice: undefined,
      maxPrice: undefined,
      color: undefined,
      size: undefined,
      minRating: undefined,
      inStock: undefined,
      sort: "popularity",
      page: 1
    });
  }

  const selectedColor = query.color ?? ALL_VALUE;
  const selectedSize = query.size ?? ALL_VALUE;
  const selectedRating = query.minRating != null ? String(query.minRating) : ALL_VALUE;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-line bg-white p-5">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <SlidersHorizontal size={18} strokeWidth={1.6} />
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("shop.filters")}</h2>
          </div>

          <div className="border-b border-line py-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">{t("shop.category")}</p>
            <div className="mt-4 space-y-3">
              {categoryNames.map((category) => (
                <label key={category} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  <span>{category}</span>
                  <input
                    type="checkbox"
                    checked={query.category.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 accent-ink"
                  />
                </label>
              ))}
            </div>
          </div>

          {results.facets.brands.length > 0 ? (
            <div className="border-b border-line py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">{t("shop.brand")}</p>
              <div className="mt-4 space-y-3">
                {results.facets.brands.map((brand) => (
                  <label key={brand} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                    <span>{brand}</span>
                    <input
                      type="checkbox"
                      checked={query.brand.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 accent-ink"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-b border-line py-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">{t("shop.priceRange")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-xs text-stone">
                <span className="mb-2 block uppercase tracking-[0.18em]">{t("shop.minPrice")}</span>
                <input
                  type="number"
                  min={0}
                  value={query.minPrice ?? ""}
                  onChange={(event) =>
                    updateQuery({
                      minPrice: event.target.value ? Number(event.target.value) : undefined,
                      page: 1
                    })
                  }
                  placeholder={formatPrice(results.facets.minPrice)}
                  className="w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
                />
              </label>
              <label className="block text-xs text-stone">
                <span className="mb-2 block uppercase tracking-[0.18em]">{t("shop.maxPrice")}</span>
                <input
                  type="number"
                  min={0}
                  value={query.maxPrice ?? ""}
                  onChange={(event) =>
                    updateQuery({
                      maxPrice: event.target.value ? Number(event.target.value) : undefined,
                      page: 1
                    })
                  }
                  placeholder={formatPrice(results.facets.maxPrice)}
                  className="w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
                />
              </label>
            </div>
          </div>

          <div className="border-b border-line py-5">
            <label htmlFor="color" className="text-xs font-medium uppercase tracking-[0.18em] text-stone">
              {t("shop.color")}
            </label>
            <select
              id="color"
              value={selectedColor}
              onChange={(event) =>
                updateQuery({
                  color: event.target.value === ALL_VALUE ? undefined : event.target.value,
                  page: 1
                })
              }
              className="mt-3 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
            >
              <option value={ALL_VALUE}>{t("shop.allColors")}</option>
              {results.facets.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="border-b border-line py-5">
            <label htmlFor="size" className="text-xs font-medium uppercase tracking-[0.18em] text-stone">
              {t("shop.size")}
            </label>
            <select
              id="size"
              value={selectedSize}
              onChange={(event) =>
                updateQuery({
                  size: event.target.value === ALL_VALUE ? undefined : event.target.value,
                  page: 1
                })
              }
              className="mt-3 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
            >
              <option value={ALL_VALUE}>{t("shop.allSizes")}</option>
              {results.facets.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="border-b border-line py-5">
            <label htmlFor="rating" className="text-xs font-medium uppercase tracking-[0.18em] text-stone">
              {t("shop.rating")}
            </label>
            <select
              id="rating"
              value={selectedRating}
              onChange={(event) =>
                updateQuery({
                  minRating: event.target.value === ALL_VALUE ? undefined : Number(event.target.value),
                  page: 1
                })
              }
              className="mt-3 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
            >
              <option value={ALL_VALUE}>{t("shop.allRatings")}</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {t("shop.ratingAndUp", { rating })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 py-5">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>{t("shop.inStockOnly")}</span>
              <input
                type="checkbox"
                checked={Boolean(query.inStock)}
                onChange={(event) => updateQuery({ inStock: event.target.checked ? true : undefined, page: 1 })}
                className="h-4 w-4 accent-ink"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="w-full border border-line px-4 py-3 text-sm text-ink transition-colors hover:border-ink"
          >
            {t("shop.reset")}
          </button>
        </div>
      </aside>

      <section aria-label="Product results">
        <div className="mb-8 grid gap-4 border-b border-line pb-6 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">{t("shop.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone" size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder={t("shop.searchPlaceholder")}
              className="h-12 w-full border border-line bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
            />
          </label>

          <label>
            <span className="sr-only">{t("shop.sortBy")}</span>
            <select
              value={query.sort}
              onChange={(event) => updateQuery({ sort: event.target.value as ProductSearchQuery["sort"], page: 1 })}
              className="h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors focus:border-ink"
            >
              <option value="newest">{t("shop.newest")}</option>
              <option value="price-asc">{t("shop.priceLowHigh")}</option>
              <option value="price-desc">{t("shop.priceHighLow")}</option>
              <option value="popularity">{t("shop.popularity")}</option>
              <option value="rating">{t("shop.topRated")}</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 text-sm text-stone">
          <p>{t("shop.showing", { count: results.total })}</p>
          {query.category.length > 0 ? (
            <button
              type="button"
              onClick={() => updateQuery({ category: [], page: 1 })}
              className="text-ink underline underline-offset-4"
            >
              {t("shop.clearCategories")}
            </button>
          ) : null}
        </div>

        {errorMessage ? <p className="mb-4 text-sm text-red-700">{errorMessage}</p> : null}

        <div className={cn(isPending ? "opacity-60 transition-opacity" : "")}>
          <ProductGrid products={results.items} emptyMessage={t("shop.noProducts")} />
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={results.page === 1 || isPending}
            onClick={() => updateQuery({ page: Math.max(1, results.page - 1) })}
            aria-label={t("shop.previous")}
          >
            <ChevronLeft size={18} strokeWidth={1.6} />
          </button>
          <span className="min-w-24 text-center text-sm text-stone">
            {t("shop.page", { current: results.page, total: results.totalPages })}
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={results.page === results.totalPages || isPending}
            onClick={() => updateQuery({ page: Math.min(results.totalPages, results.page + 1) })}
            aria-label={t("shop.next")}
          >
            <ChevronRight size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div
          className={cn(
            "mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone",
            results.total <= results.pageSize ? "hidden" : ""
          )}
        >
          {t("shop.pagination")}
        </div>
      </section>
    </div>
  );
}

export function parseShopSearchParams(searchParams?: Record<string, string | string[] | undefined>) {
  return parseProductSearchParams(searchParams ?? {});
}
