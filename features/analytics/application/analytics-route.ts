import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession } from "@/features/identity/server";

type AnalyticsRouteHandler = (
  searchParams: URLSearchParams
) => Promise<unknown>;

export function createAnalyticsRoute(handler: AnalyticsRouteHandler, handleError: (error: unknown) => NextResponse) {
  return async function GET(request: NextRequest) {
    const unauthorized = await requireAdminApiSession(request);
    if (unauthorized) return unauthorized;

    try {
      const data = await handler(request.nextUrl.searchParams);
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  };
}
