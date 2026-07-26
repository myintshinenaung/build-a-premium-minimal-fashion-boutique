import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductListing } from "@/features/catalog/client";
import { getCategories, getCategoryBySlug } from "@/features/catalog/server";
import { getTranslator } from "@/features/i18n/server";
import { searchProductCatalog } from "@/features/search/server";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildPageMetadata, getStoreSettings } from "@/features/settings/server";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings, { t }] = await Promise.all([getCategoryBySlug(slug), getStoreSettings(), getTranslator()]);

  if (!category) {
    return {
      title: t("categories.eyebrow")
    };
  }

  return buildPageMetadata(settings, {
    title: category.name,
    description: category.description,
    openGraphImage: category.image
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [{ t }, category] = await Promise.all([getTranslator(), getCategoryBySlug(slug)]);
  if (!category) notFound();

  const [results, categories] = await Promise.all([
    searchProductCatalog({ category: category.name }),
    getCategories()
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:px-8">
        <div>
          <Link href="/categories" className="text-sm text-stone underline underline-offset-8">
            {t("categories.eyebrow")}
          </Link>
          <SectionHeader
            className="mt-8"
            eyebrow={t("categories.eyebrow")}
            title={category.name}
            description={category.description}
          />
        </div>
        <BoutiqueImage
          src={category.image}
          alt={category.name}
          className="aspect-[16/9] rounded-[2px]"
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <ProductListing categories={categories} initialResults={results} />
      </section>
    </>
  );
}
