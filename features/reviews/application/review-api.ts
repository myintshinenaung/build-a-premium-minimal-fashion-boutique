import { NextResponse } from "next/server";
import {
  ReviewAccessError,
  ReviewNotFoundError,
  ReviewValidationError,
  VerifiedPurchaseRequiredError
} from "@/features/reviews/application/review-errors";

export function handleReviewApiError(error: unknown) {
  if (error instanceof ReviewValidationError || error instanceof VerifiedPurchaseRequiredError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof ReviewNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  if (error instanceof ReviewAccessError) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ message }, { status: 500 });
}
