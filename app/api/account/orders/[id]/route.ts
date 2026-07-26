import { NextResponse, type NextRequest } from "next/server";
import { accountOrderService, handleAccountApiError, requireCustomerApiSession } from "@/features/account/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await context.params;
    const order = await accountOrderService.getOrder(session.account.id, id);
    return session.withAuthCookies(NextResponse.json({ order }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
