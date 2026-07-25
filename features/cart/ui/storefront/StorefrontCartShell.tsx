"use client";

import type { ReactNode } from "react";
import { MiniCartDrawer } from "@/features/cart/ui/storefront/MiniCartDrawer";

type StorefrontCartShellProps = {
  children: ReactNode;
};

export function StorefrontCartShell({ children }: StorefrontCartShellProps) {
  return (
    <>
      {children}
      <MiniCartDrawer />
    </>
  );
}
