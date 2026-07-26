export function normalizeWishlistProductIds(productIds: string[]) {
  return Array.from(new Set(productIds.map((productId) => productId.trim()).filter(Boolean)));
}

export function isProductInWishlist(productIds: string[], productId: string) {
  return productIds.includes(productId);
}
