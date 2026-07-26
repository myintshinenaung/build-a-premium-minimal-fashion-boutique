import { getProducts } from "@/features/catalog/server";
import { buildReviewSummary, calculateTotalPages, normalizePage } from "@/features/reviews/domain/rating-calculator";
import {
  reviewInputSchema,
  reviewListQuerySchema,
  reviewReportInputSchema,
  reviewUpdateInputSchema
} from "@/features/reviews/domain/review-schemas";
import {
  ReviewAccessError,
  ReviewNotFoundError,
  ReviewValidationError,
  VerifiedPurchaseRequiredError
} from "@/features/reviews/application/review-errors";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import type { CustomerReviewEntry, PaginatedReviews, ProductReview, ProductReviewWithAuthor } from "@/types/review";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid review request.";
}

async function getPublishedProduct(productId: string) {
  const products = await getProducts();
  return products.find((product) => product.id === productId) ?? null;
}

async function attachAuthors(reviews: ProductReview[], viewerAccountId?: string): Promise<ProductReviewWithAuthor[]> {
  const accountIds = Array.from(new Set(reviews.map((review) => review.accountId)));
  const names = await reviewRepository.getAccountNamesByIds(accountIds);
  const helpfulVotes = viewerAccountId
    ? await reviewRepository.listHelpfulVotesForReviews(
        reviews.map((review) => review.id),
        viewerAccountId
      )
    : new Set<string>();

  return reviews.map((review) => ({
    ...review,
    authorName: names.get(review.accountId) ?? "Customer",
    viewerHasVotedHelpful: viewerAccountId ? helpfulVotes.has(review.id) : false
  }));
}

async function ensureVerifiedPurchase(accountId: string, productId: string) {
  const orderId = await reviewRepository.findVerifiedPurchaseOrderId(accountId, productId);

  if (!orderId) {
    throw new VerifiedPurchaseRequiredError("Only verified purchasers can submit reviews.");
  }

  return orderId;
}

export async function listProductReviews(query: unknown, viewerAccountId?: string): Promise<PaginatedReviews> {
  let parsed;

  try {
    parsed = reviewListQuerySchema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ReviewValidationError(formatZodError(error));
    }

    throw error;
  }

  const product = await getPublishedProduct(parsed.productId);

  if (!product) {
    throw new ReviewValidationError("Product is not available.");
  }

  const [ratings, pageResult] = await Promise.all([
    reviewRepository.listPublishedRatingsByProduct(parsed.productId),
    reviewRepository.listPublishedByProduct(parsed.productId, parsed.page, parsed.pageSize)
  ]);

  const totalPages = calculateTotalPages(pageResult.total, parsed.pageSize);
  const page = normalizePage(parsed.page, totalPages);
  const items = await attachAuthors(pageResult.items, viewerAccountId);

  return {
    items,
    page,
    pageSize: parsed.pageSize,
    total: pageResult.total,
    totalPages,
    summary: buildReviewSummary(ratings)
  };
}

export async function createReview(accountId: string, input: unknown): Promise<ProductReview> {
  let parsed;

  try {
    parsed = reviewInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ReviewValidationError(formatZodError(error));
    }

    throw error;
  }

  const product = await getPublishedProduct(parsed.productId);

  if (!product) {
    throw new ReviewValidationError("Product is not available.");
  }

  const existing = await reviewRepository.getByAccountAndProduct(accountId, parsed.productId);

  if (existing) {
    throw new ReviewValidationError("You have already reviewed this product.");
  }

  const orderId = await ensureVerifiedPurchase(accountId, parsed.productId);

  return reviewRepository.create({
    productId: parsed.productId,
    accountId,
    orderId,
    rating: parsed.rating,
    title: parsed.title?.trim() ?? "",
    body: parsed.body.trim(),
    verifiedPurchase: true
  });
}

export async function updateReview(accountId: string, reviewId: string, input: unknown): Promise<ProductReview> {
  let parsed;

  try {
    parsed = reviewUpdateInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ReviewValidationError(formatZodError(error));
    }

    throw error;
  }

  const review = await reviewRepository.getById(reviewId);

  if (!review) {
    throw new ReviewNotFoundError("Review not found.");
  }

  if (review.accountId !== accountId) {
    throw new ReviewAccessError("You can only edit your own reviews.");
  }

  await ensureVerifiedPurchase(accountId, review.productId);

  const updated = await reviewRepository.update(reviewId, {
    rating: parsed.rating,
    title: parsed.title?.trim(),
    body: parsed.body?.trim(),
    status: "pending"
  });

  if (!updated) {
    throw new ReviewNotFoundError("Review not found.");
  }

  return updated;
}

export async function deleteReview(accountId: string, reviewId: string) {
  const review = await reviewRepository.getById(reviewId);

  if (!review) {
    throw new ReviewNotFoundError("Review not found.");
  }

  if (review.accountId !== accountId) {
    throw new ReviewAccessError("You can only delete your own reviews.");
  }

  await reviewRepository.delete(reviewId);
  return { ok: true as const };
}

export async function toggleHelpfulVote(accountId: string, reviewId: string) {
  const review = await reviewRepository.getById(reviewId);

  if (!review || review.status !== "published") {
    throw new ReviewNotFoundError("Review not found.");
  }

  if (review.accountId === accountId) {
    throw new ReviewValidationError("You cannot vote on your own review.");
  }

  const existingVote = await reviewRepository.getHelpfulVote(reviewId, accountId);

  if (existingVote) {
    await reviewRepository.removeHelpfulVote(reviewId, accountId);
    const updated = await reviewRepository.incrementHelpfulCount(reviewId, -1);

    return {
      helpful: false,
      helpfulCount: updated?.helpfulCount ?? Math.max(review.helpfulCount - 1, 0)
    };
  }

  const updated = await reviewRepository.addHelpfulVote(reviewId, accountId);

  return {
    helpful: true,
    helpfulCount: updated?.helpfulCount ?? review.helpfulCount + 1
  };
}

export async function reportReview(accountId: string, reviewId: string, input: unknown) {
  let parsed;

  try {
    parsed = reviewReportInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ReviewValidationError(formatZodError(error));
    }

    throw error;
  }

  const review = await reviewRepository.getById(reviewId);

  if (!review || review.status !== "published") {
    throw new ReviewNotFoundError("Review not found.");
  }

  if (review.accountId === accountId) {
    throw new ReviewValidationError("You cannot report your own review.");
  }

  const report = await reviewRepository.createReport(reviewId, accountId, parsed.reason.trim());

  return { ok: true as const, reportId: report.id };
}

export async function getCustomerReviews(accountId: string): Promise<CustomerReviewEntry[]> {
  const [reviews, products] = await Promise.all([reviewRepository.listByAccountId(accountId), getProducts()]);
  const productById = new Map(products.map((product) => [product.id, product]));

  return reviews
    .map((review) => {
      const product = productById.get(review.productId);
      return product
        ? {
            ...review,
            productName: product.name,
            productSlug: product.slug
          }
        : null;
    })
    .filter((entry): entry is CustomerReviewEntry => entry !== null);
}

export async function getReviewById(reviewId: string) {
  return reviewRepository.getById(reviewId);
}
