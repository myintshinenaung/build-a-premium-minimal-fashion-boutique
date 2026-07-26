import { NextResponse, type NextRequest } from "next/server";
import { requireCustomerApiSession } from "@/features/account/server";
import { handleReviewApiError, toggleHelpfulVote } from "@/features/reviews/server";

type ReviewRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: ReviewRouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await params;
    const result = await toggleHelpfulVote(session.account.id, id);
    return session.withAuthCookies(NextResponse.json(result));
  } catch (error) {
    return session.withAuthCookies(handleReviewApiError(error));
  }
}
