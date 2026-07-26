import { getProducts } from "@/features/catalog/server";
import { calculateAverageRating } from "@/features/reviews/domain/rating-calculator";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import type { ProductSearchRecord } from "@/features/search/domain/product-search";

export const productSearchRepository = {
  async loadSearchCatalog(): Promise<ProductSearchRecord[]> {
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
