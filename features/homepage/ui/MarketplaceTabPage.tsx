import type { ReactNode } from "react";
import { MarketplaceBottomNav } from "@/features/homepage/ui/MarketplaceBottomNav";
import { MarketplaceHeader } from "@/features/homepage/ui/MarketplaceHeader";

type MarketplaceTabPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

/** Shared chrome for marketplace tab destinations (Stores / Discover / Account). */
export function MarketplaceTabPage({ title, description, children }: MarketplaceTabPageProps) {
  return (
    <>
      <MarketplaceHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-12 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-novora-muted">NOVORA</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-novora-ink sm:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-novora-muted sm:text-base">{description}</p>
        </header>
        {children ? <div className="mt-8">{children}</div> : null}
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
