import { NextResponse, type NextRequest } from "next/server";
import { requireCustomerApiSession } from "@/features/account/server";
import { deleteReview, handleReviewApiError, updateReview } from "@/features/reviews/server";

type ReviewRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: ReviewRouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await params;
    const review = await updateReview(session.account.id, id, await request.json());
    return session.withAuthCookies(NextResponse.json({ review }));
  } catch (error) {
    return session.withAuthCookies(handleReviewApiError(error));
  }
}

export async function DELETE(request: NextRequest, { params }: ReviewRouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await params;
    await deleteReview(session.account.id, id);
    return session.withAuthCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return session.withAuthCookies(handleReviewApiError(error));
  }
}
