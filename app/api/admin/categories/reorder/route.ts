import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { invalidateCatalogCache } from "@/features/performance/server";
import { categoryService } from "@/features/catalog/server";

type CategoryReorderBody = {
  ids: string[];
};

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { ids } = (await request.json()) as CategoryReorderBody;
    const categories = await categoryService.reorderCategories(ids);
    await invalidateCatalogCache();

    return NextResponse.json({ categories });
  } catch (error) {
    return jsonError(error);
  }
}
