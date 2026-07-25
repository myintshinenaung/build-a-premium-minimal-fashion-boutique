import { NextResponse, type NextRequest } from "next/server";
import { createPayment } from "@/features/payment/application/create-payment";
import {
  PaymentConfigurationError,
  PaymentConflictError,
  PaymentValidationError
} from "@/features/payment/application/payment-errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payment = await createPayment(body);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof PaymentConflictError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    if (error instanceof PaymentConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    console.error("Payment creation failed", error);
    return NextResponse.json({ message: "Unable to start payment. Please try again." }, { status: 500 });
  }
}
