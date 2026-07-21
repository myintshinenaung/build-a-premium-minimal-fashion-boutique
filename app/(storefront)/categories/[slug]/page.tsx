import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/ProductListing";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/storefront/catalog";
import { buildPageMetadata } from "@/lib/storefront/metadata";
import { getStoreSettings } from "@/lib/storefront/settings";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getStoreSettings()]);

  if (!category) {
    return {
      title: "Category"
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
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [categoryProducts, categories] = await Promise.all([
    getProductsByCategory(category.name),
    getCategories()
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:px-8">
        <div>
          <Link href="/categories" className="text-sm text-stone underline underline-offset-8">
            Categories
          </Link>
          <SectionHeader className="mt-8" eyebrow="Category" title={category.name} description={category.description} />
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
        <ProductListing products={categoryProducts} categories={categories} initialCategory={category.name} />
      </section>
    </>
  );
}
