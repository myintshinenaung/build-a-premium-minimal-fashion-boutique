import {
  productRepository,
  type ProductCreateInput,
  type ProductListParams,
  type ProductUpdateInput
} from "@/features/catalog/infrastructure/product-repository";

export type { ProductCreateInput, ProductListParams, ProductUpdateInput };
import type { AdminStatus } from "@/types/admin";

export const productService = {
  getProducts(params?: ProductListParams) {
    return productRepository.list(params);
  },

  getProduct(id: string) {
    return productRepository.getById(id);
  },

  createProduct(input: ProductCreateInput) {
    return productRepository.create(input);
  },

  updateProduct(id: string, input: ProductUpdateInput) {
    return productRepository.update(id, input);
  },

  deleteProduct(id: string) {
    return productRepository.delete(id);
  },

  bulkUpdateStatus(ids: string[], status: AdminStatus) {
    return productRepository.bulkUpdateStatus(ids, status);
  },

  bulkDeleteProducts(ids: string[]) {
    return productRepository.bulkDelete(ids);
  },

  duplicateProduct(id: string) {
    return productRepository.duplicate(id);
  }
};
