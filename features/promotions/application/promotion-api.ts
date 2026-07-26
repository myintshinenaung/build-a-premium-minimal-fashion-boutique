import { NextResponse } from "next/server";
import { CouponNotFoundError, PromotionValidationError } from "@/features/promotions/application/promotion-errors";

export function handlePromotionApiError(error: unknown) {
  if (error instanceof PromotionValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof CouponNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ message }, { status: 500 });
}
