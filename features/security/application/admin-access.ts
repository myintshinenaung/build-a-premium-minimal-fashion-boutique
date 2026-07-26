import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { mapSupabaseUserToAdminUser } from "@/features/identity/application/admin-session";
import { getAdminAuthorizationErrorMessage, isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";
import {
  getSessionExpiryDate,
  hasPermission,
  isSessionExpired,
  normalizeAdminRole,
  parseDeviceLabel,
  resolvePermissionForRoute
} from "@/features/security/domain/permissions";
import { auditRepository, loginHistoryRepository, permissionRepository, roleRepository, sessionRepository } from "@/features/security/infrastructure/security-repository";
import type { AdminRole, AuditAction, PermissionKey } from "@/types/security";

export type AdminAccessContext = {
  user: User;
  userId: string;
  userName: string;
  userEmail: string;
  role: AdminRole;
  sessionToken: string | null;
};

function getRequestMeta(request: NextRequest) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent")
  };
}

export function getSessionTokenFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return request.cookies.get("sb-access-token")?.value ?? null;
}

async function resolveUserRole(user: User): Promise<AdminRole> {
  const assignment = await roleRepository.getByUserId(user.id);
  if (assignment) {
    return assignment.role;
  }

  const metadataRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null;
  return normalizeAdminRole(metadataRole, "admin");
}

export async function recordAuditEvent(input: {
  request?: NextRequest;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}) {
  const meta = input.request ? getRequestMeta(input.request) : { ipAddress: null, userAgent: null };

  return auditRepository.create({
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    details: input.details,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent
  });
}

export async function recordAdminLoginAttempt(input: {
  request: NextRequest;
  user?: User | null;
  email: string;
  success: boolean;
  failureReason?: string | null;
}) {
  const meta = getRequestMeta(input.request);

  await loginHistoryRepository.create({
    userId: input.user?.id ?? null,
    userEmail: input.email,
    success: input.success,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    deviceLabel: parseDeviceLabel(meta.userAgent),
    failureReason: input.failureReason ?? null
  });

  if (input.success && input.user?.email) {
    const adminUser = mapSupabaseUserToAdminUser(input.user);
    await recordAuditEvent({
      request: input.request,
      userId: input.user.id,
      userName: adminUser.name,
      userEmail: input.user.email,
      action: "login",
      resource: "auth",
      details: { deviceLabel: parseDeviceLabel(meta.userAgent) }
    });

    const sessionToken = getSessionTokenFromRequest(input.request) ?? input.user.id;
    await sessionRepository.create({
      userId: input.user.id,
      userEmail: input.user.email,
      sessionToken,
      deviceLabel: parseDeviceLabel(meta.userAgent),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt: getSessionExpiryDate()
    });
  }
}

export async function recordAdminLogout(input: { request: NextRequest; user: User | null }) {
  if (!input.user?.email) {
    return;
  }

  const adminUser = mapSupabaseUserToAdminUser(input.user);
  await recordAuditEvent({
    request: input.request,
    userId: input.user.id,
    userName: adminUser.name,
    userEmail: input.user.email,
    action: "logout",
    resource: "auth"
  });
}

export async function resolveAdminAccess(request: NextRequest, requiredPermission?: PermissionKey | null) {
  const { supabase, withAuthCookies } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: withAuthCookies(NextResponse.json({ message: "Unauthorized" }, { status: 401 }))
    };
  }

  if (!isAuthorizedAdmin(user)) {
    await supabase.auth.signOut();
    return {
      error: withAuthCookies(NextResponse.json({ message: getAdminAuthorizationErrorMessage() }, { status: 403 }))
    };
  }

  const role = await resolveUserRole(user);
  const permission =
    requiredPermission === undefined
      ? resolvePermissionForRoute(request.nextUrl.pathname, request.method)
      : requiredPermission;

  if (permission) {
    const overrides = await permissionRepository.listOverrides();
    if (!hasPermission(role, permission, overrides)) {
      return {
        error: withAuthCookies(
          NextResponse.json({ message: "Forbidden. You do not have permission to perform this action." }, { status: 403 })
        )
      };
    }
  }

  const sessionToken = getSessionTokenFromRequest(request);
  if (sessionToken) {
    await sessionRepository.touch(sessionToken);
  }

  const adminUser = mapSupabaseUserToAdminUser(user);

  return {
    context: {
      user,
      userId: user.id,
      userName: adminUser.name,
      userEmail: user.email ?? "",
      role,
      sessionToken
    } satisfies AdminAccessContext,
    withAuthCookies
  };
}

export async function getActiveSessions(currentSessionToken?: string | null) {
  return sessionRepository.listActive(currentSessionToken);
}

export async function revokeSession(sessionId: string, actor: AdminAccessContext, request: NextRequest) {
  const session = await sessionRepository.revoke(sessionId);

  await recordAuditEvent({
    request,
    userId: actor.userId,
    userName: actor.userName,
    userEmail: actor.userEmail,
    action: "session_revoke",
    resource: "sessions",
    resourceId: sessionId,
    details: { targetUserEmail: session.userEmail }
  });

  return session;
}

export function isExpiredSession(expiresAt: string) {
  return isSessionExpired(expiresAt);
}
