import { NextResponse, type NextRequest } from "next/server";
import {
  consumeReservation,
  InsufficientStockError,
  InventoryValidationError,
  releaseReservation,
  ReservationConflictError,
  ReservationNotFoundError,
  reserveStock
} from "@/features/inventory/server";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid inventory request.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reservation = await reserveStock(body);

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof InventoryValidationError) {
      return NextResponse.json({ message: error instanceof ZodError ? formatZodError(error) : error.message }, { status: 400 });
    }

    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Inventory reservation failed", error);
    return NextResponse.json({ message: "Unable to reserve stock." }, { status: 500 });
  }
}
