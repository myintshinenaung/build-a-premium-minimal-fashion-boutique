import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTabPage } from "@/features/homepage/client";

export const metadata: Metadata = {
  title: "Account"
};

export default function AccountPage() {
  return (
    <MarketplaceTabPage
      title="Account"
      description="Manage your NOVORA profile, addresses, and orders. Customer sign-in UI is not available on the storefront yet — account APIs already exist for the next account sprint."
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-novora-border bg-novora-surface/70 px-5 py-5">
          <p className="text-sm font-semibold text-novora-ink">Sign in coming soon</p>
          <p className="mt-2 text-sm leading-6 text-novora-muted">
            This page is the Account entry point for V1 navigation. Full profile, address book, and order history UI will connect here next.
          </p>
        </div>
        <Link
          href="/wishlist"
          className="flex items-center justify-between rounded-2xl border border-novora-border bg-white px-5 py-4 text-sm font-medium text-novora-ink transition-colors hover:bg-novora-surface"
        >
          Wishlist
          <span className="text-novora-muted">Open</span>
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-between rounded-2xl border border-novora-border bg-white px-5 py-4 text-sm font-medium text-novora-ink transition-colors hover:bg-novora-surface"
        >
          Continue shopping
          <span className="text-novora-muted">Shop</span>
        </Link>
      </div>
    </MarketplaceTabPage>
  );
}
