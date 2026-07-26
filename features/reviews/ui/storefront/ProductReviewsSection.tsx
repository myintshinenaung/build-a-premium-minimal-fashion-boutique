"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Star, ThumbsUp } from "lucide-react";
import { useTranslator } from "@/features/i18n/client";
import type { PaginatedReviews, ProductReviewWithAuthor } from "@/types/review";
import { cn } from "@/lib/utils";

type ProductReviewsSectionProps = {
  productId: string;
};

const inputClass =
  "mt-2 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={14}
      strokeWidth={1.7}
      className={cn(index < rating ? "fill-ink text-ink" : "text-stone/40")}
    />
  ));
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { t } = useTranslator();
  const [data, setData] = useState<PaginatedReviews | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);

  async function loadReviews(nextPage = page) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}&page=${nextPage}&pageSize=5`);
      const payload = (await response.json()) as PaginatedReviews & { message?: string };

      if (!response.ok) {
        setError(payload.message ?? t("reviews.error"));
        return;
      }

      setData(payload);
      setPage(payload.page);
    } catch {
      setError(t("reviews.error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews(1);
  }, [productId]);

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          rating,
          title,
          body
        })
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setFormError(payload.message ?? t("reviews.error"));
        return;
      }

      setTitle("");
      setBody("");
      setRating(5);
      setFormSuccess(t("reviews.submitted"));
      await loadReviews(1);
    } catch {
      setFormError(t("reviews.error"));
    }
  }

  async function handleHelpfulVote(review: ProductReviewWithAuthor) {
    setPendingReviewId(review.id);

    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, { method: "POST" });
      const payload = (await response.json()) as { helpful?: boolean; helpfulCount?: number; message?: string };

      if (!response.ok) {
        setError(payload.message ?? t("reviews.error"));
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === review.id
                  ? {
                      ...item,
                      helpfulCount: payload.helpfulCount ?? item.helpfulCount,
                      viewerHasVotedHelpful: payload.helpful ?? false
                    }
                  : item
              )
            }
          : current
      );
    } catch {
      setError(t("reviews.error"));
    } finally {
      setPendingReviewId(null);
    }
  }

  async function handleReportReview(reviewId: string) {
    if (!reportReason.trim()) {
      setError(t("reviews.reportReasonRequired"));
      return;
    }

    setPendingReviewId(reviewId);
    setError("");

    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reportReason })
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? t("reviews.error"));
        return;
      }

      setReportReviewId(null);
      setReportReason("");
      setFormSuccess(t("reviews.reported"));
    } catch {
      setError(t("reviews.error"));
    } finally {
      setPendingReviewId(null);
    }
  }

  return (
    <section className="border-t border-line pt-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{t("reviews.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-medium text-ink">{t("reviews.title")}</h2>
        </div>
        {data ? (
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              {renderStars(Math.round(data.summary.averageRating))}
              <span className="text-lg font-medium text-ink">{data.summary.averageRating.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-sm text-stone">{t("reviews.totalReviews", { count: data.summary.totalReviews })}</p>
          </div>
        ) : null}
      </div>

      {data ? (
        <div className="mt-8 grid gap-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = data.summary.distribution[stars as 1 | 2 | 3 | 4 | 5];
            const width = data.summary.totalReviews > 0 ? (count / data.summary.totalReviews) * 100 : 0;

            return (
              <div key={stars} className="grid grid-cols-[48px_1fr_32px] items-center gap-3 text-sm text-stone">
                <span>{stars}★</span>
                <div className="h-2 bg-mist">
                  <div className="h-2 bg-ink" style={{ width: `${width}%` }} />
                </div>
                <span className="text-right">{count}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <form onSubmit={handleSubmitReview} className="mt-10 border border-line bg-white p-6">
        <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("reviews.writeReview")}</h3>
        <p className="mt-2 text-sm text-stone">{t("reviews.verifiedPurchaseOnly")}</p>

        <div className="mt-6 grid gap-5">
          <label className="block">
            <span className={labelClass}>{t("reviews.rating")}</span>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-ink"
                  aria-label={t("reviews.rateStars", { count: value })}
                >
                  <Star size={16} strokeWidth={1.7} className={cn(value <= rating ? "fill-ink text-ink" : "text-stone/40")} />
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className={labelClass}>{t("reviews.reviewTitle")}</span>
            <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label className="block">
            <span className={labelClass}>{t("reviews.reviewBody")}</span>
            <textarea className={`${inputClass} min-h-28 resize-y`} value={body} onChange={(event) => setBody(event.target.value)} required />
          </label>
        </div>

        {formError ? <p className="mt-4 text-sm text-red-700">{formError}</p> : null}
        {formSuccess ? <p className="mt-4 text-sm text-stone">{formSuccess}</p> : null}

        <button
          type="submit"
          className="mt-6 inline-flex h-11 items-center justify-center bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
        >
          {t("reviews.submitReview")}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        {isLoading ? <p className="text-sm text-stone">{t("reviews.loading")}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {!isLoading && data?.items.length === 0 ? <p className="text-sm text-stone">{t("reviews.empty")}</p> : null}

        {data?.items.map((review) => (
          <article key={review.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">{renderStars(review.rating)}</div>
                <p className="mt-2 text-sm font-medium text-ink">{review.authorName}</p>
                {review.verifiedPurchase ? <p className="mt-1 text-xs text-stone">{t("reviews.verifiedPurchase")}</p> : null}
              </div>
              <p className="text-xs text-stone">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>

            {review.title ? <h4 className="mt-4 text-sm font-medium text-ink">{review.title}</h4> : null}
            <p className="mt-3 text-sm leading-7 text-stone">{review.body}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleHelpfulVote(review)}
                disabled={pendingReviewId === review.id}
                className={cn(
                  "inline-flex h-10 items-center gap-2 border px-4 text-sm transition-colors",
                  review.viewerHasVotedHelpful ? "border-ink text-ink" : "border-line text-stone hover:border-ink hover:text-ink"
                )}
              >
                <ThumbsUp size={15} strokeWidth={1.7} />
                {t("reviews.helpful", { count: review.helpfulCount })}
              </button>
              <button
                type="button"
                onClick={() => setReportReviewId((current) => (current === review.id ? null : review.id))}
                className="inline-flex h-10 items-center gap-2 border border-line px-4 text-sm text-stone transition-colors hover:border-ink hover:text-ink"
              >
                <Flag size={15} strokeWidth={1.7} />
                {t("reviews.report")}
              </button>
            </div>

            {reportReviewId === review.id ? (
              <div className="mt-4 border-t border-line pt-4">
                <label className="block">
                  <span className={labelClass}>{t("reviews.reportReason")}</span>
                  <textarea
                    className={`${inputClass} min-h-20 resize-y`}
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleReportReview(review.id)}
                  disabled={pendingReviewId === review.id}
                  className="mt-4 inline-flex h-10 items-center justify-center border border-ink px-4 text-sm text-ink transition-colors hover:bg-mist"
                >
                  {t("reviews.submitReport")}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {data && data.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => void loadReviews(page - 1)}
            disabled={page <= 1 || isLoading}
            className="inline-flex h-10 items-center gap-2 border border-line px-4 text-sm text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} strokeWidth={1.7} />
            {t("reviews.previous")}
          </button>
          <p className="text-sm text-stone">{t("reviews.page", { current: page, total: data.totalPages })}</p>
          <button
            type="button"
            onClick={() => void loadReviews(page + 1)}
            disabled={page >= data.totalPages || isLoading}
            className="inline-flex h-10 items-center gap-2 border border-line px-4 text-sm text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("reviews.next")}
            <ChevronRight size={16} strokeWidth={1.7} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
