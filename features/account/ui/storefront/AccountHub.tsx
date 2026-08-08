"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Star,
  UserRound
} from "lucide-react";
import { useState } from "react";
import type { CustomerProfile } from "@/types/account";

const menuItems = [
  { href: "/account/profile", label: "Profile", description: "Name, phone, and preferences", icon: UserRound },
  { href: "/account/orders", label: "My Orders", description: "Track and review your purchases", icon: Package },
  { href: "/account/addresses", label: "Addresses", description: "Delivery addresses for Myanmar orders", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", description: "Saved pieces you love", icon: Heart },
  { href: "/account/reviews", label: "Reviews", description: "Your product reviews", icon: Star },
  { href: "/account/settings", label: "Settings", description: "Language and account preferences", icon: Settings }
];

type AccountHubProps = {
  profile: CustomerProfile;
};

export function AccountHub({ profile }: AccountHubProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setIsSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/account/auth/logout", { method: "POST" });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Unable to sign out.");
        return;
      }

      router.replace("/account");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-novora-border bg-novora-surface/70 px-5 py-5">
        <p className="text-sm font-semibold text-novora-ink">{profile.name}</p>
        <p className="mt-1 text-sm text-novora-muted">{profile.email || profile.phone || "NOVORA customer"}</p>
      </div>

      <nav aria-label="Account" className="overflow-hidden rounded-3xl border border-novora-border bg-white">
        <ul className="divide-y divide-novora-border">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-novora-surface/80 sm:px-5"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-novora-surface text-novora-ink">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-novora-ink">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-novora-muted">{item.description}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-novora-muted" strokeWidth={2} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {error ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{error}</p> : null}

      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-novora-border bg-white text-sm font-medium text-novora-ink transition-colors hover:bg-novora-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={16} strokeWidth={1.8} />
        {isSigningOut ? "Signing out…" : "Logout"}
      </button>
    </div>
  );
}
