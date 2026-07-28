import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { productRailService, type ProductRailUpdateInput } from "@/features/product-rails/server";
import { invalidateProductRailCache } from "@/features/performance/server";

type ProductRailRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: ProductRailRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as ProductRailUpdateInput;
    const rail = await productRailService.updateProductRail(id, input);
    await invalidateProductRailCache();

    if (!rail) {
      return NextResponse.json({ message: "Product rail not found" }, { status: 404 });
    }

    return NextResponse.json({ rail });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: ProductRailRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await productRailService.deleteProductRail(id);
    await invalidateProductRailCache();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
