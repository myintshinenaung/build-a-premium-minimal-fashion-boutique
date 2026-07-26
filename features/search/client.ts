/** Client-safe search exports. */
export { ProductSearchModal, SearchKeyboardShortcut } from "@/features/search/ui/storefront/ProductSearchModal";
export { SearchProvider, useSearch } from "@/features/search/ui/storefront/SearchProvider";
export { getPopularSearchTerms, searchProducts } from "@/features/search/domain/search-query";
export { buildProductSearchPath, productSearchQueryToSearchParams } from "@/features/search/domain/product-search";
export { clearRecentSearches, readRecentSearches, writeRecentSearch } from "@/features/search/infrastructure/search-history";
