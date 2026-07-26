import { NextResponse, type NextRequest } from "next/server";
import { accountOrderService, handleAccountApiError, requireCustomerApiSession } from "@/features/account/server";

export async function GET(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const orders = await accountOrderService.listOrders(session.account.id);
    return session.withAuthCookies(NextResponse.json({ orders }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
