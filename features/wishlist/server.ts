/** Server-only wishlist exports. */
export {
  addToWishlist,
  getWishlist,
  getWishlistProductIds,
  removeFromWishlist,
  toggleWishlist
} from "@/features/wishlist/application/wishlist-service";
export { handleWishlistApiError } from "@/features/wishlist/application/wishlist-api";
export { WishlistItemNotFoundError, WishlistValidationError } from "@/features/wishlist/application/wishlist-errors";
export { wishlistRepository } from "@/features/wishlist/infrastructure/wishlist-repository";
