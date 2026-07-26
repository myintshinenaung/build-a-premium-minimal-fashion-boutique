import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { promotionAdminService } from "@/features/promotions/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const coupons = await promotionAdminService.listCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const coupon = await promotionAdminService.createCoupon(await request.json());
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
