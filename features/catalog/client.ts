/** Client-safe catalog exports. */
export { CategoryManager } from "@/features/catalog/ui/admin/CategoryManager";
export { ProductManager } from "@/features/catalog/ui/admin/ProductManager";
export { OrderButtons } from "@/features/catalog/ui/storefront/OrderButtons";
export { ProductGallery } from "@/features/catalog/ui/storefront/ProductGallery";
export { ProductListing } from "@/features/catalog/ui/storefront/ProductListing";
export { ProductPurchasePanel } from "@/features/catalog/ui/storefront/ProductPurchasePanel";
export { QuantitySelector } from "@/features/catalog/ui/storefront/QuantitySelector";
export { ShareProduct } from "@/features/catalog/ui/storefront/ShareProduct";
export { VariantSelectors } from "@/features/catalog/ui/storefront/VariantSelectors";
export {
  findProductVariant,
  getAvailableColors,
  getAvailableSizes,
  getDefaultVariantSelection,
  isColorSelectable,
  isSizeSelectable,
  isVariantAvailable
} from "@/features/catalog/domain/variants";
