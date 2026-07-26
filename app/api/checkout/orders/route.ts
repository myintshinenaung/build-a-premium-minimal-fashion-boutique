import { NextResponse, type NextRequest } from "next/server";
import { createOrder } from "@/features/checkout/application/create-order";
import { CheckoutValidationError } from "@/features/checkout/application/validate-cart";
import { getOptionalCustomerAccountId } from "@/features/account/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = await getOptionalCustomerAccountId(request);
    const order = await createOrder(body, { accountId });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Checkout order creation failed", error);
    return NextResponse.json({ message: "Unable to place order. Please try again." }, { status: 500 });
  }
}
