"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type StorefrontChromeProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export function StorefrontChrome({ header, footer, children }: StorefrontChromeProps) {
  const pathname = usePathname();
  const isMarketplaceHome = pathname === "/";

  if (isMarketplaceHome) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <>
      {header}
      <main id="main-content">{children}</main>
      {footer}
    </>
  );
}
