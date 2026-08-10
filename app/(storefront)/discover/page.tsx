import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceTabPage } from "@/features/homepage/ui/MarketplaceTabPage";

export const metadata: Metadata = {
  title: "Discover"
};

export default function DiscoverPage() {
  return (
    <MarketplaceTabPage
      title="Discover"
      description="Explore what’s available on NOVORA. Full discovery feeds will expand as more stores join the marketplace."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/shop"
          className="rounded-2xl border border-novora-border bg-white px-5 py-6 transition-all hover:border-novora-ink/20 hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-novora-ink">Shop the catalog</p>
          <p className="mt-2 text-sm leading-6 text-novora-muted">Browse products with search, filters, and sorting.</p>
        </Link>
        <Link
          href="/stores"
          className="rounded-2xl border border-novora-border bg-white px-5 py-6 transition-all hover:border-novora-ink/20 hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-novora-ink">Browse stores</p>
          <p className="mt-2 text-sm leading-6 text-novora-muted">See which stores are live on NOVORA today.</p>
        </Link>
      </div>
    </MarketplaceTabPage>
  );
}
