import { getProducts } from "@/features/catalog/server";
import { calculateAverageRating } from "@/features/reviews/domain/rating-calculator";
import { recommendationRepository } from "@/features/recommendations/infrastructure/recommendation-repository";
import type { ProductSearchRecord } from "@/features/search/domain/product-search";

export const productSearchRepository = {
  async loadSearchCatalog(): Promise<ProductSearchRecord[]> {
    const catalog = await recommendationRepository.loadRecommendationCatalog();
    return catalog.map((product) => ({
      ...product,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount
    }));
  }
};
