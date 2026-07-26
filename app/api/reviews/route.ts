import { NextResponse, type NextRequest } from "next/server";
import { getOptionalCustomerAccountId, requireCustomerApiSession } from "@/features/account/server";
import { createReview, handleReviewApiError, listProductReviews } from "@/features/reviews/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerAccountId = await getOptionalCustomerAccountId(request);
    const reviews = await listProductReviews(
      {
        productId: searchParams.get("productId"),
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined
      },
      viewerAccountId ?? undefined
    );

    return NextResponse.json(reviews);
  } catch (error) {
    return handleReviewApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const review = await createReview(session.account.id, await request.json());
    return session.withAuthCookies(NextResponse.json({ review }, { status: 201 }));
  } catch (error) {
    return session.withAuthCookies(handleReviewApiError(error));
  }
}
