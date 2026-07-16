import { categoryRepository, type CategoryCreateInput, type CategoryUpdateInput } from "@/lib/repositories/category-repository";

export const categoryService = {
  getCategories() {
    return categoryRepository.list();
  },

  getCategory(id: string) {
    return categoryRepository.getById(id);
  },

  createCategory(input: CategoryCreateInput) {
    return categoryRepository.create(input);
  },

  updateCategory(id: string, input: CategoryUpdateInput) {
    return categoryRepository.update(id, input);
  },

  deleteCategory(id: string) {
    return categoryRepository.delete(id);
  },

  reorderCategories(ids: string[]) {
    return categoryRepository.reorder(ids);
  }
};
