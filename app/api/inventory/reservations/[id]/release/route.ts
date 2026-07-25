import { NextResponse, type NextRequest } from "next/server";
import {
  consumeReservation,
  ReservationConflictError,
  ReservationNotFoundError,
  releaseReservation
} from "@/features/inventory/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservation = await releaseReservation(id);

    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof ReservationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ReservationConflictError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Inventory reservation release failed", error);
    return NextResponse.json({ message: "Unable to release reservation." }, { status: 500 });
  }
}
