"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCartLineKey } from "@/lib/storefront/cart/line-key";
import type { AddToCartInput, CartItem } from "@/types/cart";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clearCart: () => void;
};

function clampQuantity(quantity: number, maxQuantity: number) {
  return Math.max(1, Math.min(quantity, maxQuantity));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (input) => {
        const lineKey = getCartLineKey(input.variantId);
        const quantity = clampQuantity(input.quantity ?? 1, input.maxQuantity);
        const existing = get().items.find((item) => item.lineKey === lineKey);

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.lineKey === lineKey
                ? {
                    ...item,
                    quantity: clampQuantity(item.quantity + quantity, item.maxQuantity),
                    unitPrice: input.unitPrice,
                    compareAtPrice: input.compareAtPrice,
                    maxQuantity: input.maxQuantity
                  }
                : item
            ),
            isOpen: true
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              ...input,
              lineKey,
              quantity
            }
          ],
          isOpen: true
        });
      },
      updateQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.lineKey === lineKey
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.maxQuantity)
                }
              : item
          )
        });
      },
      removeItem: (lineKey) => {
        set({ items: get().items.filter((item) => item.lineKey !== lineKey) });
      },
      clearCart: () => set({ items: [] })
    }),
    {
      name: "storefront-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
);

export function selectCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}
