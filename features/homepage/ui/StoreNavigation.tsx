"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeaturedStoreCard } from "@/features/homepage/domain/featured-stores";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import { cn } from "@/lib/utils";

type StoreNavigationProps = {
  stores: FeaturedStoreCard[];
};

export function StoreNavigation({ stores }: StoreNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const [items] = useState(stores);

  useEffect(() => {
    const container = scrollRef.current;
    const activeTab = activeTabRef.current;

    if (!container || !activeTab) {
      return;
    }

    const offset = activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="NOVORA platform stores" className="bg-transparent">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 pt-2.5 scrollbar-none scroll-smooth snap-x snap-mandatory"
      >
        {items.map((store) => {
          const isActive = store.id === ACTIVE_PLATFORM_STORE_ID || store.isActive;

          if (store.href) {
            return (
              <Link
                key={store.id}
                ref={isActive ? activeTabRef : undefined}
                href={store.href}
                className={cn(
                  "shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98]",
                  isActive
                    ? "bg-novora-ink text-white shadow-md shadow-novora-ink/15"
                    : "bg-novora-surface text-novora-muted hover:bg-novora-surface hover:text-novora-ink"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {store.label}
              </Link>
            );
          }

          return (
            <span
              key={store.id}
              className="shrink-0 snap-start cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium text-novora-muted/70"
              aria-disabled="true"
              title="Coming soon"
            >
              {store.label}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
