export type CartItem = {
  lineKey: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  maxQuantity: number;
};

export type AddToCartInput = Omit<CartItem, "lineKey" | "quantity"> & {
  quantity?: number;
};
