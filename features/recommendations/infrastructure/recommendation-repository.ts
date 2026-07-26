import { getProducts } from "@/features/catalog/application/catalog";
import { calculateAverageRating } from "@/features/reviews/domain/rating-calculator";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { timedQuery } from "@/features/performance/infrastructure/metrics-store";
import type { RecommendationRecord } from "@/features/recommendations/domain/recommendation-engine";

const loadPublishedRatingSummaries = createCachedLoader(
  "published-rating-summaries",
  [CACHE_TAGS.reviews, CACHE_TAGS.recommendations, CACHE_TAGS.search],
  CACHE_TTLS.reviews,
  () => timedQuery("reviews.rating-summaries", () => reviewRepository.listPublishedRatingSummaries())
);

const loadRecommendationCatalogData = createCachedLoader(
  "recommendation-catalog",
  [CACHE_TAGS.recommendations, CACHE_TAGS.products, CACHE_TAGS.reviews],
  CACHE_TTLS.recommendations,
  async (): Promise<RecommendationRecord[]> => {
    const [products, ratingSummaries] = await Promise.all([getProducts(), loadPublishedRatingSummaries()]);

    return products.map((product) => {
      const ratings = ratingSummaries.get(product.id) ?? [];

      return {
        ...product,
        averageRating: calculateAverageRating(ratings),
        reviewCount: ratings.length
      };
    });
  }
);

export const recommendationRepository = {
  loadRecommendationCatalog(): Promise<RecommendationRecord[]> {
    return loadRecommendationCatalogData();
  }
};
