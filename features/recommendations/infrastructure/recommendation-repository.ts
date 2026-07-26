import { getProducts } from "@/features/catalog/application/catalog";
import { calculateAverageRating } from "@/features/reviews/domain/rating-calculator";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import type { RecommendationRecord } from "@/features/recommendations/domain/recommendation-engine";

export const recommendationRepository = {
  async loadRecommendationCatalog(): Promise<RecommendationRecord[]> {
    const [products, ratingSummaries] = await Promise.all([getProducts(), reviewRepository.listPublishedRatingSummaries()]);

    return products.map((product) => {
      const ratings = ratingSummaries.get(product.id) ?? [];

      return {
        ...product,
        averageRating: calculateAverageRating(ratings),
        reviewCount: ratings.length
      };
    });
  }
};
