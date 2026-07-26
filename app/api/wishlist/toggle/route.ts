import { NextResponse, type NextRequest } from "next/server";
import { requireCustomerApiSession } from "@/features/account/server";
import { handleWishlistApiError, toggleWishlist } from "@/features/wishlist/server";

export async function POST(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const result = await toggleWishlist(session.account.id, await request.json());
    return session.withAuthCookies(NextResponse.json(result));
  } catch (error) {
    return session.withAuthCookies(handleWishlistApiError(error));
  }
}
