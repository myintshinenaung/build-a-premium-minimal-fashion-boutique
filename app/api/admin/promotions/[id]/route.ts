import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { promotionAdminService } from "@/features/promotions/server";

type PromotionRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: PromotionRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const coupon = await promotionAdminService.updateCoupon(id, await request.json());

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: PromotionRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await promotionAdminService.deleteCoupon(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
