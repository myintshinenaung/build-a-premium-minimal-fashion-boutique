"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useSearch } from "@/components/search/SearchProvider";
import { selectCartCount, useCartStore } from "@/lib/storefront/cart/store";
import { useTranslator } from "@/lib/i18n/use-translator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/shop", key: "nav.shop" as const },
  { href: "/categories", key: "nav.categories" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/contact", key: "nav.contact" as const }
];

type HeaderProps = {
  storeName: string;
};

export function Header({ storeName }: HeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslator();
  const { openSearch } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = hasHydrated ? selectCartCount(items) : 0;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        {t("header.skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.34em] text-ink"
          aria-label={t("header.homeAria", { storeName })}
        >
          {storeName}
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-stone transition-colors hover:text-ink",
                pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-ink" : ""
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact className="hidden md:inline-flex" />
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label={t("header.search")}
          >
            <Search size={18} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label={
              cartCount > 0 ? t("header.openCartWithCount", { count: cartCount }) : t("header.openCart")
            }
          >
            <ShoppingBag size={18} strokeWidth={1.7} />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist md:hidden"
            aria-label={isOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={20} strokeWidth={1.7} /> : <Menu size={20} strokeWidth={1.7} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 md:hidden",
          isOpen ? "max-h-[420px]" : "max-h-0 border-t-0"
        )}
      >
        <div className="px-4 py-4">
          <LanguageSwitcher className="mb-4 w-full justify-center" />
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "border-b border-line py-4 text-base text-stone",
                pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-ink" : ""
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
