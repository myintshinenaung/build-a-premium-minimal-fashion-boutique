import { NextResponse, type NextRequest } from "next/server";
import { handleAccountApiError, requireCustomerApiSession } from "@/features/account/server";
import { getCustomerReviews } from "@/features/reviews/server";

export async function GET(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const reviews = await getCustomerReviews(session.account.id);
    return session.withAuthCookies(NextResponse.json({ reviews }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
