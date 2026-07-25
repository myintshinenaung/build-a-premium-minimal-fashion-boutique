import { NextResponse, type NextRequest } from "next/server";
import { handlePaymentWebhook } from "@/features/payment/application/handle-webhook";
import { PaymentValidationError } from "@/features/payment/application/payment-errors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await handlePaymentWebhook(payload, signature);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Payment webhook processing failed", error);
    return NextResponse.json({ message: "Unable to process payment webhook." }, { status: 400 });
  }
}
