"use client";

import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/i18n/use-translator";
import { ProductGrid } from "./ProductGrid";

type ProductListingProps = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
};

const pageSize = 8;

export function ProductListing({ products, categories, initialCategory }: ProductListingProps) {
  const { t } = useTranslator();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedColor, setSelectedColor] = useState("All");
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [bestOnly, setBestOnly] = useState(false);
  const [page, setPage] = useState(1);

  const colors = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.colors.map((color) => color.name)))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        product.colors.some((color) => color.name.toLowerCase().includes(query));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesColor = selectedColor === "All" || product.colors.some((color) => color.name === selectedColor);
      const matchesStock = !inStockOnly || product.stockStatus !== "Sold out";
      const matchesNew = !newOnly || product.newArrival;
      const matchesBest = !bestOnly || product.bestSeller;

      return matchesSearch && matchesCategory && matchesColor && matchesStock && matchesNew && matchesBest;
    });

    return filtered.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "new") return Number(b.newArrival) - Number(a.newArrival);
      if (sort === "best") return Number(b.bestSeller) - Number(a.bestSeller);
      return Number(b.bestSeller) - Number(a.bestSeller) || Number(b.newArrival) - Number(a.newArrival);
    });
  }, [bestOnly, inStockOnly, newOnly, products, search, selectedCategories, selectedColor, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleCategory(category: string) {
    setPage(1);
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

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
              {categories.map((category) => (
                <label key={category.slug} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  <span>{category.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => toggleCategory(category.name)}
                    className="h-4 w-4 accent-ink"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="border-b border-line py-5">
            <label htmlFor="color" className="text-xs font-medium uppercase tracking-[0.18em] text-stone">
              {t("shop.color")}
            </label>
            <select
              id="color"
              value={selectedColor}
              onChange={(event) => {
                setSelectedColor(event.target.value);
                setPage(1);
              }}
              className="mt-3 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-ink"
            >
              <option>{t("shop.allColors")}</option>
              {colors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4 py-5">
            {[
              [t("shop.inStockOnly"), inStockOnly, setInStockOnly],
              [t("shop.newArrivalsOnly"), newOnly, setNewOnly],
              [t("shop.bestSellersOnly"), bestOnly, setBestOnly]
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span>{label as string}</span>
                <input
                  type="checkbox"
                  checked={checked as boolean}
                  onChange={(event) => {
                    (setter as (value: boolean) => void)(event.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 accent-ink"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategories(initialCategory ? [initialCategory] : []);
              setSelectedColor("All");
              setSort("featured");
              setInStockOnly(false);
              setNewOnly(false);
              setBestOnly(false);
              setPage(1);
            }}
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
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t("shop.searchPlaceholder")}
              className="h-12 w-full border border-line bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
            />
          </label>

          <label>
            <span className="sr-only">{t("shop.sortBy")}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="h-12 w-full border border-line bg-white px-4 text-sm outline-none transition-colors focus:border-ink"
            >
              <option value="featured">{t("shop.featured")}</option>
              <option value="new">{t("shop.newest")}</option>
              <option value="best">{t("shop.bestSellers")}</option>
              <option value="price-asc">{t("shop.priceLowHigh")}</option>
              <option value="price-desc">{t("shop.priceHighLow")}</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 text-sm text-stone">
          <p>
            {t("shop.showing", { count: filteredProducts.length })}
          </p>
          {selectedCategories.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSelectedCategories([]);
                setPage(1);
              }}
              className="text-ink underline underline-offset-4"
            >
              {t("shop.clearCategories")}
            </button>
          ) : null}
        </div>

        <ProductGrid products={pageProducts} emptyMessage={t("shop.noProducts")} />

        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            aria-label={t("shop.previous")}
          >
            <ChevronLeft size={18} strokeWidth={1.6} />
          </button>
          <span className="min-w-24 text-center text-sm text-stone">
            {t("shop.page", { current: currentPage, total: totalPages })}
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            aria-label={t("shop.next")}
          >
            <ChevronRight size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div
          className={cn(
            "mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone",
            filteredProducts.length <= pageSize ? "hidden" : ""
          )}
        >
          {t("shop.pagination")}
        </div>
      </section>
    </div>
  );
}
