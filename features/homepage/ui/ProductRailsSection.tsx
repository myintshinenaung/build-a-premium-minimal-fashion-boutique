import { HorizontalProductRail } from "@/features/homepage/ui/HorizontalProductRail";
import type { ProductRailsSectionData } from "@/types/product-rail";

type ProductRailsSectionProps = {
  data: ProductRailsSectionData;
};

export function ProductRailsSection({ data }: ProductRailsSectionProps) {
  if (data.rails.length === 0) {
    return null;
  }

  return (
    <>
      {data.rails.map((rail) => (
        <HorizontalProductRail
          key={rail.id}
          title={rail.title}
          subtitle={rail.subtitle || undefined}
          description={rail.description || undefined}
          products={rail.products}
          badge={rail.badge || undefined}
        />
      ))}
    </>
  );
}

export function ProductRailsSkeleton() {
  return (
    <section className="mt-10 space-y-10" aria-busy="true" aria-label="Loading product rails">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index}>
          <div className="mb-4 px-4 sm:px-6 lg:px-8">
            <div className="h-6 w-40 animate-pulse rounded-full bg-novora-border/70" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded-full bg-novora-border/50" />
          </div>
          <div className="flex gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6 lg:px-8">
            {Array.from({ length: 4 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                className="w-[168px] shrink-0 overflow-hidden rounded-2xl bg-novora-surface ring-1 ring-novora-border/60 sm:w-[200px]"
              >
                <div className="aspect-[3/4] animate-pulse bg-novora-border/50" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-full animate-pulse rounded-full bg-novora-border/60" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-novora-border/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
