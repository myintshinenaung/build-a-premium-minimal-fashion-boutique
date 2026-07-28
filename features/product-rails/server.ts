/** Server-only product rail exports. */
export { productRailService } from "@/features/product-rails/application/product-rail-service";
export { getProductRailsSectionData } from "@/features/product-rails/application/storefront-product-rails";
export {
  productRailRepository,
  type ProductRailCreateInput,
  type ProductRailUpdateInput
} from "@/features/product-rails/infrastructure/product-rail-repository";
