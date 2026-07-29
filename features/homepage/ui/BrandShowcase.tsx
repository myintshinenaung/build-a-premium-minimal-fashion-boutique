import Link from "next/link";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";

type BrandShowcaseProps = {
  brands: string[];
};

export function BrandShowcase({ brands }: BrandShowcaseProps) {
  const items = brands.filter(Boolean).slice(0, 8);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 pb-8">
      <SectionHeading
        title="Brand Showcase"
        subtitle="Labels shoppers love at Daily Outfit"
        actionLabel="Explore"
        actionHref="/shop"
      />
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:px-6 lg:px-8">
        {items.map((brand) => (
          <Link
            key={brand}
            href={`/shop?brand=${encodeURIComponent(brand)}`}
            className="inline-flex shrink-0 items-center rounded-2xl border border-novora-border bg-white px-5 py-4 text-sm font-semibold text-novora-ink shadow-sm transition-all hover:border-novora-accent/40 hover:shadow-md"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
}
