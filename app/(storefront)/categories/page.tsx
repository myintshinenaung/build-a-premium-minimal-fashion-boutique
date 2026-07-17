import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategories } from "@/lib/storefront/catalog";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore Atelier Lune dresses, tops, pants, jeans, shoes, bags, and accessories."
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Categories"
        title="Shop the boutique edit"
        description="Every category is intentionally narrow, giving each piece space to work with the rest of the wardrobe."
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group border border-line bg-white">
            <BoutiqueImage
              src={category.image}
              alt={category.name}
              className="aspect-[4/5]"
              imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="flex items-end justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-medium text-ink">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-stone">{category.description}</p>
              </div>
              <ArrowRight className="mb-1 shrink-0 text-ink" size={18} strokeWidth={1.6} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
