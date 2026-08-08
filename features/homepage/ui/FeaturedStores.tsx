import Link from "next/link";
import {
  mapPlatformStoresToFeaturedCards,
  type FeaturedStoreCard
} from "@/features/homepage/domain/featured-stores";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";
import { cn } from "@/lib/utils";

export type { FeaturedStoreCard } from "@/features/homepage/domain/featured-stores";
export { mapPlatformStoresToFeaturedCards } from "@/features/homepage/domain/featured-stores";

type FeaturedStoresProps = {
  stores?: FeaturedStoreCard[];
};

export function FeaturedStores({ stores }: FeaturedStoresProps) {
  const items = stores ?? mapPlatformStoresToFeaturedCards();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10" aria-label="Featured stores">
      <SectionHeading
        title="Featured Stores"
        subtitle="Stores available on NOVORA today"
        actionLabel="All stores"
        actionHref="/stores"
      />
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:gap-4 sm:px-6 lg:px-8">
        {items.map((store) => {
          const content = (
            <>
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold",
                  store.href ? "bg-novora-ink text-white" : "bg-novora-surface text-novora-muted"
                )}
              >
                {store.monogram}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-novora-ink">{store.label}</span>
                <span className="mt-0.5 block truncate text-xs text-novora-muted">
                  {store.href ? store.description : "Coming soon"}
                </span>
              </span>
            </>
          );

          if (store.href) {
            return (
              <Link
                key={store.id}
                href={store.href}
                className="inline-flex w-[220px] shrink-0 items-center gap-3 rounded-2xl border border-novora-border bg-white px-4 py-3 shadow-sm transition-all hover:border-novora-ink/20 hover:shadow-md"
                aria-current={store.isActive ? "page" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={store.id}
              className="inline-flex w-[220px] shrink-0 items-center gap-3 rounded-2xl border border-dashed border-novora-border bg-novora-surface/60 px-4 py-3 opacity-80"
              aria-disabled="true"
              title="Coming soon"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
