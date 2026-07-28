import {
  productRailRepository,
  type ProductRailCreateInput,
  type ProductRailUpdateInput
} from "@/features/product-rails/infrastructure/product-rail-repository";

export type { ProductRailCreateInput, ProductRailUpdateInput };

export const productRailService = {
  getProductRails() {
    return productRailRepository.list();
  },

  getProductRail(id: string) {
    return productRailRepository.getWithItems(id);
  },

  getPublishedProductRailsForStore(storeId: string) {
    return productRailRepository.listPublishedForStore(storeId);
  },

  createProductRail(input: ProductRailCreateInput) {
    return productRailRepository.create(input);
  },

  updateProductRail(id: string, input: ProductRailUpdateInput) {
    return productRailRepository.update(id, input);
  },

  deleteProductRail(id: string) {
    return productRailRepository.delete(id);
  },

  duplicateProductRail(id: string) {
    return productRailRepository.duplicate(id);
  }
};
