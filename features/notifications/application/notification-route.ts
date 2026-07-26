import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { handleNotificationServiceError } from "@/features/notifications/application/notification-service";
import { createSecurityGetRoute, createSecurityPatchRoute, createSecurityPostRoute } from "@/features/security/application/security-route";
import type { PermissionKey } from "@/types/security";

function handleError(error: unknown) {
  const result = handleNotificationServiceError(error);
  return NextResponse.json({ message: result.message }, { status: result.status });
}

export function createNotificationGetRoute(
  handler: (searchParams: URLSearchParams, context: import("@/features/security/application/admin-access").AdminAccessContext) => Promise<unknown>,
  permission: PermissionKey = "marketing:read"
) {
  return createSecurityGetRoute(handler, permission);
}

export function createNotificationPatchRoute(
  handler: (
    body: unknown,
    context: import("@/features/security/application/admin-access").AdminAccessContext,
    request: NextRequest
  ) => Promise<unknown>,
  permission: PermissionKey = "marketing:write"
) {
  return createSecurityPatchRoute(async (body, context, request) => {
    try {
      return await handler(body, context, request);
    } catch (error) {
      throw error;
    }
  }, permission);
}

export function createNotificationPostRoute(
  handler: (
    body: unknown,
    context: import("@/features/security/application/admin-access").AdminAccessContext,
    request: NextRequest
  ) => Promise<unknown>,
  permission: PermissionKey = "marketing:write"
) {
  return createSecurityPostRoute(handler, permission);
}

export function handleNotificationApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  return handleError(error);
}
