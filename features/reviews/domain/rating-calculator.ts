import type { ProductReview, RatingDistribution, ReviewSummary } from "@/types/review";

export const EMPTY_RATING_DISTRIBUTION: RatingDistribution = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0
};

export function buildRatingDistribution(reviews: Pick<ProductReview, "rating">[]): RatingDistribution {
  const distribution: RatingDistribution = { ...EMPTY_RATING_DISTRIBUTION };

  for (const review of reviews) {
    const rating = review.rating as keyof RatingDistribution;

    if (rating >= 1 && rating <= 5) {
      distribution[rating] += 1;
    }
  }

  return distribution;
}

export function calculateAverageRating(reviews: Pick<ProductReview, "rating">[]) {
  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function buildReviewSummary(reviews: Pick<ProductReview, "rating">[]): ReviewSummary {
  return {
    averageRating: calculateAverageRating(reviews),
    totalReviews: reviews.length,
    distribution: buildRatingDistribution(reviews)
  };
}

export function calculateTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function normalizePage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}
