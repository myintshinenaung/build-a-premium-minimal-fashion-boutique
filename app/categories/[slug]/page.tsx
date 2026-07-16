import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/ProductListing";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categories, getCategoryBySlug, getProductsByCategory } from "@/lib/products";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category"
    };
  }

  return {
    title: category.name,
    description: category.description,
    openGraph: {
      title: `${category.name} | Atelier Lune`,
      description: category.description,
      images: [category.image]
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(category.name);

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
        <ProductListing products={categoryProducts} initialCategory={category.name} />
      </section>
    </>
  );
}
