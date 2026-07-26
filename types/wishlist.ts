import type { Product } from "@/types/product";

export type WishlistItem = {
  id: string;
  accountId: string;
  productId: string;
  createdAt: string;
};

export type WishlistEntry = WishlistItem & {
  product: Product;
};
