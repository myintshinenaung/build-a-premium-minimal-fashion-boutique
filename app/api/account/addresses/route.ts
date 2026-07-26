import { NextResponse, type NextRequest } from "next/server";
import {
  createAddress,
  handleAccountApiError,
  listAddresses,
  requireCustomerApiSession
} from "@/features/account/server";

export async function GET(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const addresses = await listAddresses(session.account.id);
    return session.withAuthCookies(NextResponse.json({ addresses }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const address = await createAddress(session.account.id, body);
    return session.withAuthCookies(NextResponse.json({ address }, { status: 201 }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
