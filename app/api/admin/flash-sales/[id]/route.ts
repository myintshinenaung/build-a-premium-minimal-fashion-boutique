import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { flashSaleService, type FlashSaleUpdateInput } from "@/features/flash-sale/server";
import { invalidatePromotionCache } from "@/features/performance/server";

type FlashSaleRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: FlashSaleRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as FlashSaleUpdateInput;
    const flashSale = await flashSaleService.updateFlashSale(id, input);
    await invalidatePromotionCache();

    if (!flashSale) {
      return NextResponse.json({ message: "Flash sale not found" }, { status: 404 });
    }

    return NextResponse.json({ flashSale });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: FlashSaleRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await flashSaleService.deleteFlashSale(id);
    await invalidatePromotionCache();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
