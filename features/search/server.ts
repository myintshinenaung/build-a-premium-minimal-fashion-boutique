/** Server-only search exports. Import from Server Components, route handlers, and server actions. */
export { getSearchIndex, productToSearchIndex } from "@/features/search/application/get-search-index";
export { handleSearchApiError, searchProductCatalog } from "@/features/search/application/search-service";
export { SearchValidationError } from "@/features/search/application/search-errors";
export { productSearchRepository } from "@/features/search/infrastructure/product-search-repository";
