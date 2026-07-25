import { NextResponse } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { inventoryService } from "@/features/inventory/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const inventory = await inventoryService.listProductInventory();

    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
