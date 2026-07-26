import { describe, expect, it } from "vitest";
import {
  buildRatingDistribution,
  buildReviewSummary,
  calculateAverageRating,
  calculateTotalPages,
  normalizePage
} from "@/features/reviews/domain/rating-calculator";

describe("rating-calculator", () => {
  it("calculates average rating to one decimal place", () => {
    expect(calculateAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3);
    expect(calculateAverageRating([])).toBe(0);
  });

  it("builds rating distribution counts", () => {
    expect(buildRatingDistribution([{ rating: 5 }, { rating: 5 }, { rating: 3 }, { rating: 1 }])).toEqual({
      1: 1,
      2: 0,
      3: 1,
      4: 0,
      5: 2
    });
  });

  it("builds a review summary", () => {
    expect(buildReviewSummary([{ rating: 4 }, { rating: 2 }])).toEqual({
      averageRating: 3,
      totalReviews: 2,
      distribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0 }
    });
  });

  it("normalizes pagination values", () => {
    expect(calculateTotalPages(11, 5)).toBe(3);
    expect(normalizePage(0, 3)).toBe(1);
    expect(normalizePage(9, 3)).toBe(3);
  });
});
