import { NextResponse, type NextRequest } from "next/server";
import {
  getProfile,
  handleAccountApiError,
  requireCustomerApiSession,
  updateProfile
} from "@/features/account/server";

export async function GET(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const profile = await getProfile(session.account.id);
    return session.withAuthCookies(NextResponse.json({ profile }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}

export async function PUT(request: NextRequest) {
  const session = await requireCustomerApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const profile = await updateProfile(session.account.id, body);
    return session.withAuthCookies(NextResponse.json({ profile }));
  } catch (error) {
    return session.withAuthCookies(handleAccountApiError(error));
  }
}
