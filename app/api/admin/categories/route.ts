import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { invalidateCatalogCache } from "@/features/performance/server";
import { categoryService, type CategoryCreateInput } from "@/features/catalog/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const categories = await categoryService.getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as CategoryCreateInput;
    const category = await categoryService.createCategory(input);
    await invalidateCatalogCache();

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
