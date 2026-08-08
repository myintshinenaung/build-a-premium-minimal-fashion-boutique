import { NextResponse, type NextRequest } from "next/server";
import { handleAccountApiError } from "@/features/account/application/customer-api";
import { signInCustomer } from "@/features/account/application/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await signInCustomer(request, body);
  } catch (error) {
    return handleAccountApiError(error);
  }
}
