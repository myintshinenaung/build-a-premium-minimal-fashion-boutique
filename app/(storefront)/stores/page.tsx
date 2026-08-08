import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTabPage } from "@/features/homepage/ui/MarketplaceTabPage";
import {
  getFeaturedStoreCards,
  getPlatformCategories,
  getStoresByPlatformCategorySlug
} from "@/features/stores/server";
import { buildStoreHref } from "@/features/stores/domain/store-schemas";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stores"
};

type StoresPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const resolved = await searchParams;
  const platformSlug = typeof resolved?.platform === "string" ? resolved.platform : "";
  const [platformCategories, allCards, filteredStores] = await Promise.all([
    getPlatformCategories(),
    getFeaturedStoreCards(),
    platformSlug ? getStoresByPlatformCategorySlug(platformSlug) : Promise.resolve(null)
  ]);

  const cards =
    filteredStores?.map((store) => ({
      id: store.id,
      label: store.name,
      description: store.description,
      monogram: store.monogram || store.name.slice(0, 2).toUpperCase(),
      href: buildStoreHref(store),
      isActive: store.id === ACTIVE_PLATFORM_STORE_ID
    })) ?? allCards;

  const activePlatform = platformCategories.find((category) => category.slug === platformSlug);

  return (
    <MarketplaceTabPage
      title="Stores"
      description={
        activePlatform
          ? `${activePlatform.name} stores on NOVORA.`
          : "Browse stores on NOVORA. Active stores open their catalog. Inactive stores stay listed as coming soon."
      }
    >
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/stores"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
            !platformSlug ? "bg-novora-ink text-white" : "bg-novora-surface text-novora-muted"
          )}
        >
          All
        </Link>
        {platformCategories.map((category) => (
          <Link
            key={category.id}
            href={`/stores?platform=${encodeURIComponent(category.slug)}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
              platformSlug === category.slug ? "bg-novora-ink text-white" : "bg-novora-surface text-novora-muted"
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-novora-border bg-novora-surface/50 px-5 py-10 text-center">
          <p className="text-sm text-novora-muted">No stores are available in this platform category yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-novora-border overflow-hidden rounded-2xl border border-novora-border bg-white">
          {cards.map((store) => {
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
      )}
    </MarketplaceTabPage>
  );
}
