"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Tags,
  UserCircle,
  Users,
  X
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { ADMIN_SHELLLESS_PATHS, ADMIN_THEME_STORAGE_KEY } from "@/lib/admin-auth";
import type { AdminUser } from "@/lib/admin-session";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/banners", label: "Banner Manager", icon: Image },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/banners": "Banner Manager",
  "/admin/media": "Media Library",
  "/admin/settings": "Settings"
};

type AdminShellProps = {
  children: ReactNode;
  user: AdminUser | null;
};

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  });

  if (ADMIN_SHELLLESS_PATHS.some((path) => pathname === path)) {
    return <>{children}</>;
  }

  const currentTitle = pageTitles[pathname] ?? "Admin";
  const displayName = user?.name ?? "Admin";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role ?? "Store Manager";

  function setAdminTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, nextTheme);
  }

  return (
    <div
      data-admin-theme={theme}
      suppressHydrationWarning
      className="min-h-screen bg-mist text-ink lg:grid lg:grid-cols-[264px_1fr]"
    >
      <aside className="hidden border-r border-line bg-white lg:block">
        <AdminSidebar pathname={pathname} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={20} strokeWidth={1.7} />
              </button>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone">Atelier Lune Admin</p>
                <p className="text-sm font-medium text-ink">{currentTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative hidden md:block">
                <span className="sr-only">Search admin</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={16} />
                <input
                  type="search"
                  placeholder="Search"
                  className="h-10 w-56 border border-line bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
                />
              </label>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                onClick={() => setAdminTheme(theme === "light" ? "dark" : "light")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              >
                {theme === "light" ? <Moon size={18} strokeWidth={1.7} /> : <Sun size={18} strokeWidth={1.7} />}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((value) => !value)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-2 pl-3 text-ink transition-colors hover:bg-mist"
                  aria-label="Open user menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="hidden text-sm md:inline">{displayName}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                    <UserCircle size={16} strokeWidth={1.7} />
                  </span>
                  <ChevronDown size={14} strokeWidth={1.8} />
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-12 z-50 w-72 border border-line bg-white p-4 shadow-soft",
                    isUserMenuOpen ? "block" : "hidden"
                  )}
                >
                  <div className="border-b border-line pb-4">
                    <p className="text-sm font-medium text-ink">{displayName}</p>
                    <p className="mt-1 text-xs text-stone">{displayEmail}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone">{displayRole}</p>
                  </div>
                  <div className="grid gap-2 border-b border-line py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminTheme("light")}
                        className={cn("h-10 border px-3 text-sm", theme === "light" ? "border-ink bg-ink text-white" : "border-line text-ink")}
                      >
                        Light
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminTheme("dark")}
                        className={cn("h-10 border px-3 text-sm", theme === "dark" ? "border-ink bg-ink text-white" : "border-line text-ink")}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                  <Link
                    href="/admin/logout"
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-line text-sm text-ink transition-colors hover:border-ink"
                  >
                    <LogOut size={16} strokeWidth={1.7} />
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/20 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!isOpen}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] w-[86vw] max-w-80 border-r border-line bg-white transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-ink">Atelier</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label="Close admin menu"
          >
            <X size={20} strokeWidth={1.7} />
          </button>
        </div>
        <AdminSidebar pathname={pathname} onNavigate={() => setIsOpen(false)} />
      </aside>
    </div>
  );
}

function AdminSidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-line px-6 py-6">
        <Link href="/admin" className="block text-sm font-semibold uppercase tracking-[0.34em] text-ink">
          Atelier Lune
        </Link>
        <div className="mt-5 flex items-center gap-3 border border-line p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
            <ShieldCheck size={17} strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Admin Area</p>
            <p className="text-xs text-stone">UI prototype</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 text-sm transition-colors",
                active ? "bg-ink text-white" : "text-stone hover:bg-mist hover:text-ink"
              )}
            >
              <Icon size={18} strokeWidth={1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-6">
        <Link href="/" className="text-sm text-stone underline underline-offset-8">
          View public website
        </Link>
      </div>
    </div>
  );
}
