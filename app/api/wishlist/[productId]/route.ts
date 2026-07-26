import { NextResponse, type NextRequest } from "next/server";
import { requireCustomerApiSession } from "@/features/account/server";
import { handleWishlistApiError, removeFromWishlist } from "@/features/wishlist/server";

type WishlistRouteContext = {
  params: Promise<{ productId: string }>;
};

export async function DELETE(request: NextRequest, { params }: WishlistRouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { productId } = await params;
    await removeFromWishlist(session.account.id, decodeURIComponent(productId));
    return session.withAuthCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return session.withAuthCookies(handleWishlistApiError(error));
  }
}
