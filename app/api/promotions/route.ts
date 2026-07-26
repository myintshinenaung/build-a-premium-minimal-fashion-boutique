import { NextResponse } from "next/server";
import { handlePromotionApiError, promotionService } from "@/features/promotions/server";

export async function GET() {
  try {
    const promotions = await promotionService.listPromotions();
    return NextResponse.json({ promotions });
  } catch (error) {
    return handlePromotionApiError(error);
  }
}
