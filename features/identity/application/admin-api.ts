import { NextResponse, type NextRequest } from "next/server";
import { mapSupabaseUserToAdminUser } from "@/features/identity/application/admin-session";
import { getAdminAuthorizationErrorMessage, isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { applySecurityHeaders, checkRateLimit } from "@/features/security/application/api-security";
import { hasPermission, normalizeAdminRole, resolvePermissionForRoute } from "@/features/security/domain/permissions";
import { permissionRepository, roleRepository, sessionRepository } from "@/features/security/infrastructure/security-repository";
import type { PermissionKey } from "@/types/security";

function secureResponse(response: NextResponse) {
  applySecurityHeaders(response.headers);
  return response;
}

async function resolveUserRole(userId: string, metadataRole?: string | null) {
  const assignment = await roleRepository.getByUserId(userId);
  if (assignment) {
    return assignment.role;
  }

  return normalizeAdminRole(metadataRole, "admin");
}

export async function requireAdminApiSession(request: NextRequest, requiredPermission?: PermissionKey | null) {
  const rateLimit = checkRateLimit(request);
  if (rateLimit) {
    return secureResponse(NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 }));
  }

  const { supabase, withAuthCookies } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return withAuthCookies(secureResponse(NextResponse.json({ message: "Unauthorized" }, { status: 401 })));
  }

  if (!isAuthorizedAdmin(user)) {
    await supabase.auth.signOut();
    return withAuthCookies(
      secureResponse(NextResponse.json({ message: getAdminAuthorizationErrorMessage() }, { status: 403 }))
    );
  }

  const permission =
    requiredPermission === undefined
      ? resolvePermissionForRoute(request.nextUrl.pathname, request.method)
      : requiredPermission;

  if (permission) {
    const role = await resolveUserRole(user.id, typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null);
    const overrides = await permissionRepository.listOverrides();
    if (!hasPermission(role, permission, overrides)) {
      return withAuthCookies(
        secureResponse(
          NextResponse.json({ message: "Forbidden. You do not have permission to perform this action." }, { status: 403 })
        )
      );
    }
  }

  const sessionToken = request.cookies.get("sb-access-token")?.value ?? user.id;
  await sessionRepository.touch(sessionToken).catch(() => undefined);

  return null;
}

export async function getAdminApiActor(request: NextRequest) {
  const { supabase } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, userName: "Admin", userEmail: null, role: normalizeAdminRole(null) };
  }

  const adminUser = mapSupabaseUserToAdminUser(user);
  const role = await resolveUserRole(user.id, typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null);

  return {
    userId: user.id,
    userName: adminUser.name,
    userEmail: user.email ?? null,
    role
  };
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return secureResponse(NextResponse.json({ message }, { status }));
}
