/** Server-only catalog exports. Import from Server Components, route handlers, and server actions. */
export {
  getBestSellers,
  getCategories,
  getCategoryBySlug,
  getCategorySlugs,
  getNewArrivals,
  getProductBySlug,
  getProductSlugs,
  getProducts,
  getProductsByCategory,
  getRelatedProducts
} from "@/features/catalog/application/catalog";
export { categoryService } from "@/features/catalog/application/category-service";
export { productService } from "@/features/catalog/application/product-service";
export {
  assignUniqueProductSlugs,
  mapAdminCategoryToCategory,
  mapAdminProductToProduct,
  productSlugFromName
} from "@/features/catalog/domain/map-catalog";
export { buildVariantsFromProduct, resolveProductStockStatus } from "@/features/catalog/domain/variants";
export {
  categoryRepository,
  type CategoryCreateInput,
  type CategoryUpdateInput
} from "@/features/catalog/infrastructure/category-repository";
export {
  productRepository,
  type ProductCreateInput,
  type ProductListParams,
  type ProductUpdateInput
} from "@/features/catalog/infrastructure/product-repository";
export { ProductCard } from "@/features/catalog/ui/storefront/ProductCard";
export { ProductGrid } from "@/features/catalog/ui/storefront/ProductGrid";
export { StockStatusBadge } from "@/features/catalog/ui/storefront/StockStatusBadge";
