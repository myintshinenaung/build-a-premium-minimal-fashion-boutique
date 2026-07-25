import { NextResponse, type NextRequest } from "next/server";
import { getAvailableStock, InventoryValidationError } from "@/features/inventory/server";
import { stockQuerySchema } from "@/features/inventory/domain/reservation-schemas";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid inventory request.";
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId") ?? "";
    const variantId = request.nextUrl.searchParams.get("variantId") ?? "";
    const parsed = stockQuerySchema.parse({ productId, variantId });
    const stock = await getAvailableStock(parsed.productId, parsed.variantId);

    return NextResponse.json({ stock });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: formatZodError(error) }, { status: 400 });
    }

    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Inventory stock lookup failed", error);
    return NextResponse.json({ message: "Unable to load stock availability." }, { status: 500 });
  }
}
