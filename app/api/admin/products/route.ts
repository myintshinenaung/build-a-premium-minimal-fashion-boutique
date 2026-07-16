import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { productService } from "@/lib/services";
import type { ProductCreateInput } from "@/lib/repositories/product-repository";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const products = await productService.getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as ProductCreateInput;
    const product = await productService.createProduct(input);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
