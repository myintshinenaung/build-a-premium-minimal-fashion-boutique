import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { categoryService } from "@/lib/services";
import type { CategoryCreateInput } from "@/lib/repositories/category-repository";

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

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
