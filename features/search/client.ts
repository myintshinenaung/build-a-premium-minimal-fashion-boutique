/** Client-safe search exports. */
export { ProductSearchModal, SearchKeyboardShortcut } from "@/features/search/ui/storefront/ProductSearchModal";
export { RecentlyViewedTracker } from "@/features/search/ui/storefront/RecentlyViewedTracker";
export { SearchProvider, useSearch } from "@/features/search/ui/storefront/SearchProvider";
export {
  getPopularCategories,
  getPopularSearchTerms,
  getPopularStores,
  getTrendingSearchTerms,
  searchBrands,
  searchCategories,
  searchProducts,
  searchStores
} from "@/features/search/domain/search-query";
export { buildProductSearchPath, productSearchQueryToSearchParams } from "@/features/search/domain/product-search";
export { clearRecentSearches, readRecentSearches, writeRecentSearch } from "@/features/search/infrastructure/search-history";
export {
  clearRecentlyViewedProducts,
  readRecentlyViewedProducts,
  writeRecentlyViewedProduct
} from "@/features/search/infrastructure/recently-viewed";
