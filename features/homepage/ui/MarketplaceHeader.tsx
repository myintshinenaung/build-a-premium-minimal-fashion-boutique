"use client";

import Link from "next/link";
import { Bell, Search, ShoppingBag } from "lucide-react";
import { useSyncExternalStore } from "react";
import { selectCartCount, useCartStore } from "@/features/cart/client";
import { useSearch } from "@/features/search/client";
import { cn } from "@/lib/utils";

type MarketplaceHeaderProps = {
  storeName: string;
};

function subscribeToHydration() {
  return () => undefined;
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function MarketplaceHeader({ storeName }: MarketplaceHeaderProps) {
  const { openSearch } = useSearch();
  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydrationSnapshot);
  const cartCount = hasHydrated ? selectCartCount(items) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-novora-border/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="min-w-0 shrink-0">
            <p className="text-lg font-bold tracking-tight text-novora-ink sm:text-xl">NOVORA</p>
            <p className="truncate text-[11px] font-medium text-novora-muted">{storeName}</p>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-novora-ink transition-colors hover:bg-novora-surface"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-novora-ink transition-colors hover:bg-novora-surface"
              aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : "Open cart"}
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-novora-accent px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={openSearch}
          className={cn(
            "mt-3 flex w-full items-center gap-3 rounded-2xl bg-novora-surface px-4 py-3 text-left",
            "ring-1 ring-novora-border/70 transition-all hover:ring-novora-accent/40"
          )}
          aria-label="Search products"
        >
          <Search size={18} strokeWidth={2} className="shrink-0 text-novora-muted" />
          <span className="text-sm text-novora-muted">Search fashion, brands, and more</span>
        </button>
      </div>
    </header>
  );
}
