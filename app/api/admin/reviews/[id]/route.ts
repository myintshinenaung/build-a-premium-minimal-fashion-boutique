import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { reviewAdminService } from "@/features/reviews/server";

type ReviewRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: ReviewRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const review = await reviewAdminService.moderateReview(id, await request.json());
    return NextResponse.json({ review });
  } catch (error) {
    return jsonError(error);
  }
}
