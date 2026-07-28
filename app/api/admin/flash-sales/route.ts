import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { flashSaleService, type FlashSaleCreateInput } from "@/features/flash-sale/server";
import { invalidatePromotionCache } from "@/features/performance/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const flashSales = await flashSaleService.getFlashSales();
    return NextResponse.json({ flashSales });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as FlashSaleCreateInput;
    const flashSale = await flashSaleService.createFlashSale(input);
    await invalidatePromotionCache();

    return NextResponse.json({ flashSale }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
