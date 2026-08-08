import type { Metadata } from "next";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { ReviewsList } from "@/features/account/ui/storefront/ReviewsList";
import { requireCustomerPage } from "@/features/account/server";
import { getCustomerReviews } from "@/features/reviews/server";

export const metadata: Metadata = {
  title: "Reviews"
};

export const dynamic = "force-dynamic";

export default async function AccountReviewsPage() {
  const session = await requireCustomerPage("/account/reviews");
  const reviews = await getCustomerReviews(session.account.id);

  return (
    <AccountShell title="Reviews" description="Reviews you have submitted on NOVORA.">
      <ReviewsList reviews={reviews} />
    </AccountShell>
  );
}
