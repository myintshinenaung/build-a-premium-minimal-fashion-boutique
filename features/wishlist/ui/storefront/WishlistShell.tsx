"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { normalizeWishlistProductIds } from "@/features/wishlist/domain/validation";
import { useWishlistStore } from "@/features/wishlist/infrastructure/store";

type WishlistShellProps = {
  children: ReactNode;
};

export function WishlistShell({ children }: WishlistShellProps) {
  const setProductIds = useWishlistStore((state) => state.setProductIds);
  const setHasLoaded = useWishlistStore((state) => state.setHasLoaded);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      try {
        const response = await fetch("/api/wishlist");
        const payload = (await response.json()) as { productIds?: string[] };

        if (cancelled) {
          return;
        }

        if (response.ok) {
          setProductIds(normalizeWishlistProductIds(payload.productIds ?? []));
        } else {
          clearWishlist();
        }
      } catch {
        if (!cancelled) {
          clearWishlist();
        }
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    }

    void loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [clearWishlist, setHasLoaded, setProductIds]);

  return children;
}
