import { NextResponse, type NextRequest } from "next/server";
import { handlePromotionApiError, removeCoupon } from "@/features/promotions/server";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = await removeCoupon(body);

    return NextResponse.json({ summary });
  } catch (error) {
    return handlePromotionApiError(error);
  }
}
