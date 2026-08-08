"use client";

import Link from "next/link";
import { Bell, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { selectCartCount, useCartStore } from "@/features/cart/client";
import { useSearch } from "@/features/search/client";
import { StoreNavigation } from "@/features/homepage/ui/StoreNavigation";
import { cn } from "@/lib/utils";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/stores", label: "Stores" },
  { href: "/discover", label: "Discover" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/shop", label: "Shop all" }
];

function subscribeToHydration() {
  return () => undefined;
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function MarketplaceHeader() {
  const { openSearch } = useSearch();
  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydrationSnapshot);
  const cartCount = hasHydrated ? selectCartCount(items) : 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTitleId = useId();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-novora-border/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-novora-ink transition-colors hover:bg-novora-surface"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="marketplace-menu"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <Link href="/" className="min-w-0 px-1">
              <p className="text-lg font-bold tracking-tight text-novora-ink sm:text-xl">NOVORA</p>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled
              title="Notifications coming soon"
              className="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-novora-muted opacity-60"
              aria-label="Notifications coming soon"
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
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-novora-ink px-1 text-[10px] font-semibold text-white">
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
            "ring-1 ring-novora-border/70 transition-all hover:ring-novora-ink/25"
          )}
          aria-label="Search products"
        >
          <Search size={18} strokeWidth={2} className="shrink-0 text-novora-muted" />
          <span className="text-sm text-novora-muted">Search fashion, brands, and more</span>
        </button>

        <div className="-mx-4 mt-1 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <StoreNavigation />
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-[80]" id="marketplace-menu">
          <button
            type="button"
            className="absolute inset-0 bg-novora-ink/30 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={menuTitleId}
            className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-novora-border px-4 py-4">
              <p id={menuTitleId} className="text-sm font-semibold tracking-tight text-novora-ink">
                Menu
              </p>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-novora-ink transition-colors hover:bg-novora-surface"
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Marketplace">
              {menuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-novora-ink transition-colors hover:bg-novora-surface"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
