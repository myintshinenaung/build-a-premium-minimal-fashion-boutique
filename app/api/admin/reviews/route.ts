import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { reviewAdminService } from "@/features/reviews/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const reviews = await reviewAdminService.listReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    return jsonError(error);
  }
}
