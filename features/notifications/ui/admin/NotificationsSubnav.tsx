"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/notifications", label: "Dashboard" },
  { href: "/admin/notifications/templates", label: "Templates" },
  { href: "/admin/notifications/delivery-logs", label: "Delivery Logs" },
  { href: "/admin/notifications/failed", label: "Failed" }
];

export function NotificationsSubnav() {
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
