import { type NextRequest } from "next/server";
import { handleAccountApiError } from "@/features/account/application/customer-api";
import { signUpCustomer } from "@/features/account/application/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await signUpCustomer(request, body);
  } catch (error) {
    return handleAccountApiError(error);
  }
}
