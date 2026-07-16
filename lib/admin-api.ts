import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export function requireAdminApiSession(request: NextRequest) {
  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    return null;
  }

  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return NextResponse.json({ message }, { status });
}
