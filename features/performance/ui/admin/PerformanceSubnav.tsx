"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [{ href: "/admin/performance", label: "Overview" }];

export function PerformanceSubnav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto border border-line bg-white">
      <ul className="flex min-w-max divide-x divide-line">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex h-12 items-center px-4 text-sm transition-colors",
                  isActive ? "bg-ink text-white" : "text-stone hover:bg-mist hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
