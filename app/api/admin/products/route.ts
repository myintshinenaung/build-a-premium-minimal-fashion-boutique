import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { productService, type ProductCreateInput } from "@/features/catalog/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const products = await productService.getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as ProductCreateInput;
    const product = await productService.createProduct(input);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
