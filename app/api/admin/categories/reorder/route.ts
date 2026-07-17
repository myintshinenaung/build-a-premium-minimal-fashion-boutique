import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { categoryService } from "@/lib/services";

type CategoryReorderBody = {
  ids: string[];
};

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { ids } = (await request.json()) as CategoryReorderBody;
    const categories = await categoryService.reorderCategories(ids);

    return NextResponse.json({ categories });
  } catch (error) {
    return jsonError(error);
  }
}
