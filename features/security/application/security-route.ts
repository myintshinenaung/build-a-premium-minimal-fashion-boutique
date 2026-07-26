import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { resolveAdminAccess, type AdminAccessContext } from "@/features/security/application/admin-access";
import { applySecurityHeaders, checkRateLimit } from "@/features/security/application/api-security";
import type { PermissionKey } from "@/types/security";

type SecurityGetHandler = (
  searchParams: URLSearchParams,
  context: AdminAccessContext
) => Promise<unknown>;

type SecurityPatchHandler = (
  body: unknown,
  context: AdminAccessContext,
  request: NextRequest
) => Promise<unknown>;

type SecurityPostHandler = (
  body: unknown,
  context: AdminAccessContext,
  request: NextRequest
) => Promise<unknown>;

function secureJsonResponse(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  applySecurityHeaders(response.headers);
  return response;
}

function secureErrorResponse(message: string, status: number) {
  return secureJsonResponse({ message }, { status });
}

export function handleSecurityApiError(error: unknown) {
  if (error instanceof ZodError) {
    return secureErrorResponse(error.issues[0]?.message ?? "Invalid request.", 400);
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return secureErrorResponse(message, 500);
}

async function guardRequest(request: NextRequest, permission?: PermissionKey | null) {
  const rateLimit = checkRateLimit(request);
  if (rateLimit) {
    return {
      error: secureErrorResponse("Too many requests. Please try again shortly.", 429)
    };
  }

  return resolveAdminAccess(request, permission);
}

export function createSecurityGetRoute(handler: SecurityGetHandler, permission: PermissionKey = "users:read") {
  return async function GET(request: NextRequest) {
    const access = await guardRequest(request, permission);
    if ("error" in access && access.error) {
      return access.error;
    }

    try {
      const data = await handler(request.nextUrl.searchParams, access.context!);
      return secureJsonResponse(data);
    } catch (error) {
      return handleSecurityApiError(error);
    }
  };
}

export function createSecurityPatchRoute(handler: SecurityPatchHandler, permission: PermissionKey = "users:write") {
  return async function PATCH(request: NextRequest) {
    const access = await guardRequest(request, permission);
    if ("error" in access && access.error) {
      return access.error;
    }

    try {
      const body = await request.json();
      const data = await handler(body, access.context!, request);
      return secureJsonResponse(data);
    } catch (error) {
      return handleSecurityApiError(error);
    }
  };
}

export function createSecurityPostRoute(handler: SecurityPostHandler, permission: PermissionKey = "users:write") {
  return async function POST(request: NextRequest) {
    const access = await guardRequest(request, permission);
    if ("error" in access && access.error) {
      return access.error;
    }

    try {
      const body = await request.json();
      const data = await handler(body, access.context!, request);
      return secureJsonResponse(data);
    } catch (error) {
      return handleSecurityApiError(error);
    }
  };
}

export async function requireSecuredAdminApi(request: NextRequest, permission?: PermissionKey | null) {
  const rateLimit = checkRateLimit(request);
  if (rateLimit) {
    return secureErrorResponse("Too many requests. Please try again shortly.", 429);
  }

  const access = await resolveAdminAccess(request, permission);
  if ("error" in access && access.error) {
    return access.error;
  }

  return null;
}

export { secureJsonResponse, secureErrorResponse };
