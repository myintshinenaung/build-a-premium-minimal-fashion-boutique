"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MarketplaceBottomNav } from "@/features/homepage/client";

type StorefrontChromeProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

const MARKETPLACE_SHELL_PATHS = ["/", "/stores", "/discover", "/account"];

function usesMarketplaceShell(pathname: string) {
  return MARKETPLACE_SHELL_PATHS.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path)));
}

export function StorefrontChrome({ header, footer, children }: StorefrontChromeProps) {
  const pathname = usePathname();
  const isMarketplaceShell = usesMarketplaceShell(pathname);
  const showMarketplaceTabNav = pathname.startsWith("/wishlist") || isMarketplaceShell;

  if (isMarketplaceShell) {
    return <div className="min-h-screen overflow-x-hidden bg-white">{children}</div>;
  }

  return (
    <>
      {header}
      <main id="main-content" className={showMarketplaceTabNav ? "pb-24 md:pb-0" : undefined}>
        {children}
      </main>
      <div className={showMarketplaceTabNav ? "hidden md:block" : undefined}>{footer}</div>
      {showMarketplaceTabNav ? <MarketplaceBottomNav /> : null}
    </>
  );
}
