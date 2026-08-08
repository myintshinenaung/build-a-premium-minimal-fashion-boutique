import { type NextRequest } from "next/server";
import { handleAccountApiError } from "@/features/account/application/customer-api";
import { signOutCustomer } from "@/features/account/application/customer-auth";

export async function POST(request: NextRequest) {
  try {
    return await signOutCustomer(request);
  } catch (error) {
    return handleAccountApiError(error);
  }
}
