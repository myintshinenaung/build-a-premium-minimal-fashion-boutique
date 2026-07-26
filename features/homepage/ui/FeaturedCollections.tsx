import Link from "next/link";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import type { Category } from "@/types/product";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";

type FeaturedCollectionsProps = {
  categories: Category[];
};

export function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
  const collections = categories.slice(0, 4);

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <SectionHeading title="Featured Collections" subtitle="Curated edits from Daily Outfit" actionLabel="See all" actionHref="/categories" />
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4 sm:px-6 lg:px-8">
        {collections.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group overflow-hidden rounded-3xl bg-novora-surface shadow-sm ring-1 ring-novora-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <BoutiqueImage
              src={category.image}
              alt={category.name}
              className="aspect-[4/5]"
              imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(min-width: 640px) 25vw, 50vw"
            />
            <div className="p-3">
              <h3 className="text-sm font-semibold text-novora-ink">{category.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-novora-muted">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
