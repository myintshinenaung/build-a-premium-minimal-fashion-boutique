import { NextResponse, type NextRequest } from "next/server";
import { requireCustomerApiSession } from "@/features/account/server";
import { addToWishlist, getWishlist, handleWishlistApiError } from "@/features/wishlist/server";

export async function GET(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const items = await getWishlist(session.account.id);

    return session.withAuthCookies(
      NextResponse.json({
        items,
        productIds: items.map((item) => item.productId)
      })
    );
  } catch (error) {
    return session.withAuthCookies(handleWishlistApiError(error));
  }
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const item = await addToWishlist(session.account.id, await request.json());
    return session.withAuthCookies(NextResponse.json({ item }, { status: 201 }));
  } catch (error) {
    return session.withAuthCookies(handleWishlistApiError(error));
  }
}
