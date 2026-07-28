import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { productRailService } from "@/features/product-rails/server";
import { invalidateProductRailCache } from "@/features/performance/server";

type ProductRailDuplicateRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: ProductRailDuplicateRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const rail = await productRailService.duplicateProductRail(id);
    await invalidateProductRailCache();

    return NextResponse.json({ rail }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
