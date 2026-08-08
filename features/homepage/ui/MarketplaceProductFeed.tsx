import Link from "next/link";
import type { Product } from "@/types/product";
import { MarketplaceProductCard } from "@/features/homepage/ui/MarketplaceProductCard";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";

type MarketplaceProductFeedProps = {
  products: Product[];
  pageSize?: number;
};

/**
 * V1 catalog feed with a clear path to paginated shop results.
 * True infinite scroll can replace this once multi-store catalog exists.
 */
export function MarketplaceProductFeed({ products, pageSize = 8 }: MarketplaceProductFeedProps) {
  const items = products.slice(0, pageSize);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 pb-8" aria-label="Product feed">
      <SectionHeading title="Explore more" subtitle="Browse the NOVORA catalog" actionLabel="Shop all" actionHref="/shop" />
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map((product, index) => (
          <MarketplaceProductCard key={product.id} product={product} priority={index < 2} size="fluid" />
        ))}
      </div>
      {products.length > pageSize ? (
        <div className="mt-6 flex justify-center px-4">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-novora-ink px-6 text-sm font-medium text-white transition-colors hover:bg-novora-ink/90"
          >
            Load more in Shop
          </Link>
        </div>
      ) : null}
    </section>
  );
}
