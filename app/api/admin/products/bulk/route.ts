import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { productService } from "@/lib/services";
import type { AdminStatus } from "@/types/admin";

type BulkStatusBody = {
  ids: string[];
  status: AdminStatus;
};

type BulkDeleteBody = {
  ids: string[];
};

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { ids, status } = (await request.json()) as BulkStatusBody;
    const products = await productService.bulkUpdateStatus(ids, status);

    return NextResponse.json({ products });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { ids } = (await request.json()) as BulkDeleteBody;
    await productService.bulkDeleteProducts(ids);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
