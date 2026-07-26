import { reviewModerationInputSchema } from "@/features/reviews/domain/review-schemas";
import { ReviewNotFoundError, ReviewValidationError } from "@/features/reviews/application/review-errors";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid moderation request.";
}

export const reviewAdminService = {
  listReviews() {
    return reviewRepository.listAllForAdmin();
  },

  async moderateReview(reviewId: string, input: unknown) {
    let parsed;

    try {
      parsed = reviewModerationInputSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ReviewValidationError(formatZodError(error));
      }

      throw error;
    }

    const review = await reviewRepository.update(reviewId, { status: parsed.status });

    if (!review) {
      throw new ReviewNotFoundError("Review not found.");
    }

    return review;
  }
};
