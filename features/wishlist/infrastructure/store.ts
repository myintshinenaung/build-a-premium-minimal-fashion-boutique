"use client";

import { create } from "zustand";

type WishlistState = {
  productIds: string[];
  hasLoaded: boolean;
  setProductIds: (productIds: string[]) => void;
  addProductId: (productId: string) => void;
  removeProductId: (productId: string) => void;
  clearWishlist: () => void;
  setHasLoaded: (hasLoaded: boolean) => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  hasLoaded: false,
  setProductIds: (productIds) => set({ productIds }),
  addProductId: (productId) => {
    if (get().productIds.includes(productId)) {
      return;
    }

    set({ productIds: [...get().productIds, productId] });
  },
  removeProductId: (productId) => {
    set({ productIds: get().productIds.filter((id) => id !== productId) });
  },
  clearWishlist: () => set({ productIds: [] }),
  setHasLoaded: (hasLoaded) => set({ hasLoaded })
}));

export function selectWishlistCount(productIds: string[]) {
  return productIds.length;
}

export function isWishlisted(productIds: string[], productId: string) {
  return productIds.includes(productId);
}
