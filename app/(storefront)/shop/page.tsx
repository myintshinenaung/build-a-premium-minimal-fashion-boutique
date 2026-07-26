import type { Metadata } from "next";
import { ProductListing } from "@/features/catalog/client";
import { getCategories } from "@/features/catalog/server";
import { getTranslator } from "@/features/i18n/server";
import { searchProductCatalog } from "@/features/search/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildPageMetadata, getStoreSettings } from "@/features/settings/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, { t }] = await Promise.all([getStoreSettings(), getTranslator()]);

  return buildPageMetadata(settings, {
    title: t("shop.eyebrow"),
    description: t("shop.description")
  });
}

type ShopPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const [{ t }, categories, results] = await Promise.all([
    getTranslator(),
    getCategories(),
    searchProductCatalog(resolvedSearchParams ?? {})
  ]);

  const activeCategory = results.query.category.length === 1 ? results.query.category[0] : undefined;
  const title = activeCategory ?? (results.query.q ? t("shop.searchResults") : t("shop.allPieces"));

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t("shop.eyebrow")} title={title} description={t("shop.description")} />
      <div className="mt-10">
        <ProductListing categories={categories} initialResults={results} />
      </div>
    </section>
  );
}
