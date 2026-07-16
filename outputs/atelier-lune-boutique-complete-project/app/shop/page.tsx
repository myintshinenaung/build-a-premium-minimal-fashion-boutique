import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categories, products } from "@/lib/products";
import type { ProductCategory } from "@/types/product";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop Atelier Lune dresses, tops, pants, jeans, shoes, bags, and accessories."
};

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

function getInitialCategory(value?: string): ProductCategory | undefined {
  if (!value) return undefined;
  const decoded = decodeURIComponent(value).toLowerCase();
  return categories.find((category) => category.name.toLowerCase() === decoded || category.slug === decoded)?.name;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialCategory = getInitialCategory(resolvedSearchParams?.category);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Shop"
        title={initialCategory ? initialCategory : "All pieces"}
        description="Search, filter, and sort the full boutique edit."
      />
      <div className="mt-10">
        <ProductListing products={products} initialCategory={initialCategory} />
      </div>
    </section>
  );
}
