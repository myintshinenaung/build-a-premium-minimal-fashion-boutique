import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTabPage } from "@/features/homepage/client";
import { mapPlatformStoresToFeaturedCards } from "@/features/homepage/domain/featured-stores";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stores"
};

export default function StoresPage() {
  const stores = mapPlatformStoresToFeaturedCards();

  return (
    <MarketplaceTabPage
      title="Stores"
      description="Browse stores on NOVORA. Only Daily Outfit is live on this domain today — additional stores will appear here as they launch."
    >
      <ul className="divide-y divide-novora-border overflow-hidden rounded-2xl border border-novora-border bg-white">
        {stores.map((store) => {
          const rowClass = cn(
            "flex items-center gap-4 px-4 py-4 sm:px-5",
            store.href ? "transition-colors hover:bg-novora-surface/80" : "opacity-80"
          );

          const body = (
            <>
              <span
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                  store.href ? "bg-novora-ink text-white" : "bg-novora-surface text-novora-muted"
                )}
              >
                {store.monogram}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-novora-ink">{store.label}</span>
                <span className="mt-0.5 block text-xs text-novora-muted">
                  {store.href ? store.description : "Coming soon"}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-novora-muted">
                {store.href ? (store.isActive ? "Open" : "Visit") : "Soon"}
              </span>
            </>
          );

          return (
            <li key={store.id}>
              {store.href ? (
                <Link href={store.href} className={rowClass}>
                  {body}
                </Link>
              ) : (
                <div className={rowClass} aria-disabled="true" title="Coming soon">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </MarketplaceTabPage>
  );
}
