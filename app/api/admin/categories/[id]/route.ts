import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { categoryService } from "@/lib/services";
import type { CategoryUpdateInput } from "@/lib/repositories/category-repository";

type CategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: CategoryRouteContext) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as CategoryUpdateInput;
    const category = await categoryService.updateCategory(id, input);

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: CategoryRouteContext) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await categoryService.deleteCategory(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
