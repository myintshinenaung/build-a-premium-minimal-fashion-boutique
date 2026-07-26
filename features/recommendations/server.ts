/** Server-only recommendations exports. Import from Server Components, route handlers, and server actions. */
export {
  getBestSellerRecommendations,
  getNewArrivalRecommendations,
  getRecommendations,
  getRelatedProducts,
  getSimilarProducts,
  getTrendingProducts,
  handleRecommendationApiError
} from "@/features/recommendations/application/recommendation-service";
export {
  RecommendationNotFoundError,
  RecommendationValidationError
} from "@/features/recommendations/application/recommendation-errors";
export { recommendationRepository } from "@/features/recommendations/infrastructure/recommendation-repository";
export { ProductRecommendationsSection } from "@/features/recommendations/ui/storefront/ProductRecommendationsSection";
