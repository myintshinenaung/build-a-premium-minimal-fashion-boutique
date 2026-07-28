import {
  featuredCollectionRepository,
  type FeaturedCollectionCreateInput,
  type FeaturedCollectionUpdateInput
} from "@/features/featured-collections/infrastructure/featured-collection-repository";

export type { FeaturedCollectionCreateInput, FeaturedCollectionUpdateInput };

export const featuredCollectionService = {
  getFeaturedCollections() {
    return featuredCollectionRepository.list();
  },

  getFeaturedCollection(id: string) {
    return featuredCollectionRepository.getWithItems(id);
  },

  getPublishedFeaturedCollectionsForStore(storeId: string) {
    return featuredCollectionRepository.listPublishedForStore(storeId);
  },

  createFeaturedCollection(input: FeaturedCollectionCreateInput) {
    return featuredCollectionRepository.create(input);
  },

  updateFeaturedCollection(id: string, input: FeaturedCollectionUpdateInput) {
    return featuredCollectionRepository.update(id, input);
  },

  deleteFeaturedCollection(id: string) {
    return featuredCollectionRepository.delete(id);
  }
};
