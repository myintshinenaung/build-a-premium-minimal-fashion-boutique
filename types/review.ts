export type ReviewStatus = "pending" | "published" | "rejected" | "hidden";

export type ProductReview = {
  id: string;
  productId: string;
  accountId: string;
  orderId: string | null;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewWithAuthor = ProductReview & {
  authorName: string;
  viewerHasVotedHelpful?: boolean;
};

export type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
};

export type PaginatedReviews = {
  items: ProductReviewWithAuthor[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: ReviewSummary;
};

export type CustomerReviewEntry = ProductReview & {
  productName: string;
  productSlug: string;
};
