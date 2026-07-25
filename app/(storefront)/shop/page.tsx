import type { Metadata } from "next";
import { ProductListing } from "@/features/catalog/client";
import { getCategories, getProducts } from "@/features/catalog/server";
import { getTranslator } from "@/features/i18n/server";
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
  searchParams?: Promise<{
    category?: string;
  }>;
};

function getInitialCategory(categories: Awaited<ReturnType<typeof getCategories>>, value?: string) {
  if (!value) return undefined;
  const decoded = decodeURIComponent(value).toLowerCase();
  return categories.find((category) => category.name.toLowerCase() === decoded || category.slug === decoded)?.name;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const [{ t }, products, categories] = await Promise.all([getTranslator(), getProducts(), getCategories()]);
  const initialCategory = getInitialCategory(categories, resolvedSearchParams?.category);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow={t("shop.eyebrow")}
        title={initialCategory ? initialCategory : t("shop.allPieces")}
        description={t("shop.description")}
      />
      <div className="mt-10">
        <ProductListing products={products} categories={categories} initialCategory={initialCategory} />
      </div>
    </section>
  );
}
