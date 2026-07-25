import { buildVariantsFromProduct } from "@/features/catalog/domain/variants";
import { productRepository } from "@/features/catalog/infrastructure/product-repository";
import type { AdminProduct } from "@/types/admin";

export function getVariantCurrentStock(product: AdminProduct, variantId: string) {
  const variants = buildVariantsFromProduct(product);
  const variant = variants.find((entry) => entry.id === variantId);

  return variant?.stockQuantity ?? 0;
}

export async function loadProductForInventory(productId: string) {
  return productRepository.getById(productId);
}
