"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Heart, Home, Search, User } from "lucide-react";
import { useSearch } from "@/features/search/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  { href: "/categories", label: "Categories", icon: Grid3X3, match: (path: string) => path.startsWith("/categories") },
  { href: "/shop", label: "Search", icon: Search, action: "search" as const },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: (path: string) => path.startsWith("/wishlist") },
  { href: "/contact", label: "Profile", icon: User, match: (path: string) => path.startsWith("/contact") }
];

export function MarketplaceBottomNav() {
  const pathname = usePathname();
  const { openSearch } = useSearch();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-novora-border/80 bg-white/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match ? item.match(pathname) : false;

          if (item.action === "search") {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={openSearch}
                  className={cn(
                    "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                    isActive ? "text-novora-accent" : "text-novora-muted hover:text-novora-ink"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-novora-accent" : "text-novora-muted hover:text-novora-ink"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
