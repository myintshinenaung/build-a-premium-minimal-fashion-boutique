import Link from "next/link";
import type { CustomerReviewEntry } from "@/types/review";

type ReviewsListProps = {
  reviews: CustomerReviewEntry[];
};

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-novora-border bg-novora-surface/50 px-5 py-10 text-center">
        <p className="text-sm text-novora-muted">You have not written any reviews yet.</p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-novora-ink px-5 text-sm font-medium text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-3xl border border-novora-border bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/product/${review.productSlug}`} className="text-sm font-semibold text-novora-ink hover:underline">
                {review.productName}
              </Link>
              <p className="mt-1 text-xs capitalize text-novora-muted">Status: {review.status}</p>
            </div>
            <p className="text-sm font-semibold text-novora-ink">★ {review.rating}</p>
          </div>
          {review.title ? <p className="mt-3 text-sm font-medium text-novora-ink">{review.title}</p> : null}
          {review.body ? <p className="mt-2 text-sm leading-6 text-novora-muted">{review.body}</p> : null}
        </li>
      ))}
    </ul>
  );
}
