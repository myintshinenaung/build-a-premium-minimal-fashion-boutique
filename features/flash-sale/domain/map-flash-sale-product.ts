import type { Product } from "@/types/product";

/** Applies a flash-sale discount for storefront display only (does not mutate catalog records). */
export function applyFlashSaleDiscount(product: Product, discountPercent: number): Product {
  if (discountPercent <= 0) {
    return product;
  }

  const basePrice =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : product.price;
  const salePrice = Math.max(0, Math.round(basePrice * (1 - discountPercent / 100)));

  if (salePrice >= basePrice) {
    return product;
  }

  return {
    ...product,
    price: salePrice,
    compareAtPrice: basePrice
  };
}
