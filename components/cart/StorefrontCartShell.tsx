"use client";

import type { ReactNode } from "react";
import { MiniCartDrawer } from "@/components/cart/MiniCartDrawer";

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
