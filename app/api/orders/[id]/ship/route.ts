import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { shipOrder } from "@/features/shipping/application/ship-order";
import { ShippingConflictError, ShippingValidationError } from "@/features/shipping/application/shipping-errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const order = await shipOrder(id, body);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    if (error instanceof ShippingValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof ShippingConflictError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return jsonError(error);
  }
}
