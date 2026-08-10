import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MarketplaceBottomNav } from "@/features/homepage/ui/MarketplaceBottomNav";
import { MarketplaceHeader } from "@/features/homepage/ui/MarketplaceHeader";
import { getFeaturedStoreCards } from "@/features/stores/server";

type AccountShellProps = {
  title: string;
  description?: string;
  backHref?: string | null;
  backLabel?: string;
  children: ReactNode;
};

export async function AccountShell({
  title,
  description,
  backHref = "/account",
  backLabel = "Account",
  children
}: AccountShellProps) {
  const stores = await getFeaturedStoreCards();

  return (
    <>
      <MarketplaceHeader stores={stores} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-novora-muted transition-colors hover:text-novora-ink"
          >
            <ChevronLeft size={16} strokeWidth={2} />
            {backLabel}
          </Link>
        ) : null}
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-novora-muted">NOVORA</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-novora-ink sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-novora-muted">{description}</p> : null}
        </header>
        {children}
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
