import type { Product } from "@/types/product";
import { MarketplaceProductCard } from "@/features/homepage/ui/MarketplaceProductCard";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";

type HorizontalProductRailProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  actionLabel?: string;
  actionHref?: string;
  badge?: string;
};

export function HorizontalProductRail({
  title,
  subtitle,
  products,
  actionLabel,
  actionHref,
  badge
}: HorizontalProductRailProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <SectionHeading title={title} subtitle={subtitle} actionLabel={actionLabel} actionHref={actionHref} />
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:gap-4 sm:px-6 lg:px-8">
        {products.map((product, index) => (
          <MarketplaceProductCard key={product.id} product={product} priority={index < 2} badge={badge} />
        ))}
      </div>
    </section>
  );
}
