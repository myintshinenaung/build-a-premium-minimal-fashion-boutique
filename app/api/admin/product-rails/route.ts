import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { productRailService, type ProductRailCreateInput } from "@/features/product-rails/server";
import { invalidateProductRailCache } from "@/features/performance/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const rails = await productRailService.getProductRails();
    return NextResponse.json({ rails });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as ProductRailCreateInput;
    const rail = await productRailService.createProductRail(input);
    await invalidateProductRailCache();

    return NextResponse.json({ rail }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
