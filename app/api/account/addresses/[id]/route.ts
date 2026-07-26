import { NextResponse, type NextRequest } from "next/server";
import {
  deleteAddress,
  handleAccountApiError,
  requireCustomerApiSession,
  updateAddress
} from "@/features/account/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const address = await updateAddress(session.account.id, id, body);
    return session.withAuthCookies(NextResponse.json({ address }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await context.params;
    await deleteAddress(session.account.id, id);
    return session.withAuthCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
