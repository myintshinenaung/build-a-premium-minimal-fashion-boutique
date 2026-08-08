import { type NextRequest } from "next/server";
import { handleAccountApiError } from "@/features/account/application/customer-api";
import { requestCustomerPasswordReset } from "@/features/account/application/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await requestCustomerPasswordReset(request, body);
  } catch (error) {
    return handleAccountApiError(error);
  }
}
