/** Server-only store exports. */
export { storeService, StoreNotFoundError, StoreValidationError } from "@/features/stores/application/store-service";
export {
  getActiveStores,
  getFeaturedStoreCards,
  getPlatformCategories,
  getStoreBySlug,
  getStoreNavigationItems,
  getStores,
  getStoresByPlatformCategorySlug
} from "@/features/stores/application/storefront-stores";
export { storeRepository } from "@/features/stores/infrastructure/store-repository";
export { filterStoresByPlatformCategory } from "@/features/stores/domain/platform-category-filter";
export {
  categoryBelongsToStore,
  productBelongsToStore,
  storeLinkedToPlatformCategory,
  storesForPlatformCategory,
  withStoreStatus
} from "@/features/stores/domain/store-relationships";
export { buildStoreHref, deriveMonogram, slugifyStoreName } from "@/features/stores/domain/store-schemas";
