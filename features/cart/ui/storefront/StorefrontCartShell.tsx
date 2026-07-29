"use client";

import { useEffect, type ReactNode } from "react";
import { MiniCartDrawer } from "@/features/cart/ui/storefront/MiniCartDrawer";
import { useCartStore } from "@/features/cart/infrastructure/store";

type StorefrontCartShellProps = {
  children: ReactNode;
};

export function StorefrontCartShell({ children }: StorefrontCartShellProps) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <MiniCartDrawer />
    </>
  );
}
