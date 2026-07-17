import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategories, getProducts } from "@/lib/storefront/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop Atelier Lune dresses, tops, pants, jeans, shoes, bags, and accessories."
};

export const dynamic = "force-dynamic";

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
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const initialCategory = getInitialCategory(categories, resolvedSearchParams?.category);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Shop"
        title={initialCategory ? initialCategory : "All pieces"}
        description="Search, filter, and sort the full boutique edit."
      />
      <div className="mt-10">
        <ProductListing products={products} categories={categories} initialCategory={initialCategory} />
      </div>
    </section>
  );
}
