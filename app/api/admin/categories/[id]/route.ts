import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { invalidateCatalogCache } from "@/features/performance/server";
import { categoryService, type CategoryUpdateInput } from "@/features/catalog/server";

type CategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: CategoryRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as CategoryUpdateInput;
    const category = await categoryService.updateCategory(id, input);
    await invalidateCatalogCache();

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: CategoryRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await categoryService.deleteCategory(id);
    await invalidateCatalogCache();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
