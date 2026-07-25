import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { productService } from "@/features/catalog/server";

type ProductDuplicateRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: ProductDuplicateRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
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
