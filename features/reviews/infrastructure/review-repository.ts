import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductReviewRow, ReviewHelpfulVoteRow, ReviewReportRow, Database } from "@/lib/supabase/types";
import type { ProductReview, ReviewStatus } from "@/types/review";

type ProductReviewUpdate = Database["public"]["Tables"]["product_reviews"]["Update"];

export type ReviewCreateInput = {
  productId: string;
  accountId: string;
  orderId: string | null;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
};

export type ReviewUpdateInput = {
  rating?: number;
  title?: string;
  body?: string;
  status?: ReviewStatus;
};

function createReviewId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REV-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function createVoteId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RVV-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function createReportId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RPT-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export const reviewRepository = {
  async listPublishedByProduct(productId: string, page: number, pageSize: number) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("product_reviews")
        .select("*", { count: "exact" })
        .eq("product_id", productId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        items: (data ?? []).map(reviewFromRow),
        total: count ?? 0
      };
    } catch (error) {
      throw createRepositoryError("Unable to load product reviews", error);
    }
  },

  async listPublishedRatingsByProduct(productId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", productId)
        .eq("status", "published");

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({ rating: row.rating }));
    } catch (error) {
      throw createRepositoryError("Unable to load review ratings", error);
    }
  },

  async listPublishedRatingSummaries() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .eq("status", "published");

      if (error) {
        throw error;
      }

      const summaries = new Map<string, { rating: number }[]>();

      for (const row of data ?? []) {
        const current = summaries.get(row.product_id) ?? [];
        current.push({ rating: row.rating });
        summaries.set(row.product_id, current);
      }

      return summaries;
    } catch (error) {
      throw createRepositoryError("Unable to load published review ratings", error);
    }
  },

  async listByAccountId(accountId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(reviewFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load customer reviews", error);
    }
  },

  async listAllForAdmin() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("product_reviews").select("*").order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(reviewFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load reviews for moderation", error);
    }
  },

  async getById(reviewId: string): Promise<ProductReview | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("product_reviews").select("*").eq("id", reviewId).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reviewFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load review", error);
    }
  },

  async getByAccountAndProduct(accountId: string, productId: string): Promise<ProductReview | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("account_id", accountId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reviewFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load review", error);
    }
  },

  async create(input: ReviewCreateInput): Promise<ProductReview> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          id: createReviewId(),
          product_id: input.productId,
          account_id: input.accountId,
          order_id: input.orderId,
          rating: input.rating,
          title: input.title,
          body: input.body,
          status: "pending",
          verified_purchase: input.verifiedPurchase,
          helpful_count: 0,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return reviewFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create review", error);
    }
  },

  async update(reviewId: string, input: ReviewUpdateInput): Promise<ProductReview | null> {
    try {
      const supabase = createSupabaseServerClient();
      const update = reviewToUpdate(input);
      const { data, error } = await supabase.from("product_reviews").update(update).eq("id", reviewId).select("*").maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reviewFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update review", error);
    }
  },

  async delete(reviewId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw createRepositoryError("Unable to delete review", error);
    }
  },

  async getHelpfulVote(reviewId: string, accountId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("review_helpful_votes")
        .select("*")
        .eq("review_id", reviewId)
        .eq("account_id", accountId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? helpfulVoteFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load helpful vote", error);
    }
  },

  async listHelpfulVotesForReviews(reviewIds: string[], accountId?: string) {
    if (reviewIds.length === 0) {
      return new Set<string>();
    }

    try {
      const supabase = createSupabaseServerClient();
      let query = supabase.from("review_helpful_votes").select("review_id").in("review_id", reviewIds);

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Set((data ?? []).map((row) => row.review_id));
    } catch (error) {
      throw createRepositoryError("Unable to load helpful votes", error);
    }
  },

  async addHelpfulVote(reviewId: string, accountId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("review_helpful_votes").insert({
        id: createVoteId(),
        review_id: reviewId,
        account_id: accountId,
        created_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      return this.incrementHelpfulCount(reviewId, 1);
    } catch (error) {
      throw createRepositoryError("Unable to add helpful vote", error);
    }
  },

  async removeHelpfulVote(reviewId: string, accountId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("review_helpful_votes").delete().eq("review_id", reviewId).eq("account_id", accountId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw createRepositoryError("Unable to remove helpful vote", error);
    }
  },

  async incrementHelpfulCount(reviewId: string, delta: number) {
    const review = await this.getById(reviewId);

    if (!review) {
      return null;
    }

    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("product_reviews")
        .update({
          helpful_count: Math.max(review.helpfulCount + delta, 0),
          updated_at: new Date().toISOString()
        })
        .eq("id", reviewId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? reviewFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update helpful count", error);
    }
  },

  async createReport(reviewId: string, accountId: string, reason: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("review_reports")
        .insert({
          id: createReportId(),
          review_id: reviewId,
          account_id: accountId,
          reason,
          created_at: new Date().toISOString()
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return reportFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to report review", error);
    }
  },

  async findVerifiedPurchaseOrderId(accountId: string, productId: string): Promise<string | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("account_id", accountId)
        .eq("payment_status", "paid");

      if (ordersError) {
        throw ordersError;
      }

      if (!orders?.length) {
        return null;
      }

      const orderIds = orders.map((order) => order.id);
      const { data: item, error: itemsError } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds)
        .eq("product_id", productId)
        .order("order_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (itemsError) {
        throw itemsError;
      }

      return item?.order_id ?? null;
    } catch (error) {
      throw createRepositoryError("Unable to verify purchase", error);
    }
  },

  async getAccountNamesByIds(accountIds: string[]) {
    if (accountIds.length === 0) {
      return new Map<string, string>();
    }

    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("customer_accounts").select("id, name").in("id", accountIds);

      if (error) {
        throw error;
      }

      return new Map((data ?? []).map((row) => [row.id, row.name]));
    } catch (error) {
      throw createRepositoryError("Unable to load review authors", error);
    }
  }
};

function reviewFromRow(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    accountId: row.account_id,
    orderId: row.order_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    verifiedPurchase: row.verified_purchase,
    helpfulCount: row.helpful_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function reviewToUpdate(input: ReviewUpdateInput): ProductReviewUpdate {
  const update: ProductReviewUpdate = {
    updated_at: new Date().toISOString()
  };

  if (input.rating !== undefined) update.rating = input.rating;
  if (input.title !== undefined) update.title = input.title;
  if (input.body !== undefined) update.body = input.body;
  if (input.status !== undefined) update.status = input.status;

  return update;
}

function helpfulVoteFromRow(row: ReviewHelpfulVoteRow) {
  return {
    id: row.id,
    reviewId: row.review_id,
    accountId: row.account_id,
    createdAt: row.created_at
  };
}

function reportFromRow(row: ReviewReportRow) {
  return {
    id: row.id,
    reviewId: row.review_id,
    accountId: row.account_id,
    reason: row.reason,
    createdAt: row.created_at
  };
}
