import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { productService } from "@/lib/services";
import type { ProductUpdateInput } from "@/lib/repositories/product-repository";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: ProductRouteContext) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as ProductUpdateInput;
    const product = await productService.updateProduct(id, input);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, { params }: ProductRouteContext) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const product = await productService.duplicateProduct(id);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: ProductRouteContext) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await productService.deleteProduct(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
