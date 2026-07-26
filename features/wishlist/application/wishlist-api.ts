import { NextResponse } from "next/server";
import { WishlistItemNotFoundError, WishlistValidationError } from "@/features/wishlist/application/wishlist-errors";

export function handleWishlistApiError(error: unknown) {
  if (error instanceof WishlistValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof WishlistItemNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ message }, { status: 500 });
}
