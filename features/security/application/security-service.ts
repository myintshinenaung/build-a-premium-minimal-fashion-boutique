import { ZodError } from "zod";
import type { NextRequest } from "next/server";
import type { AdminAccessContext } from "@/features/security/application/admin-access";
import { recordAuditEvent } from "@/features/security/application/admin-access";
import {
  parseSecurityQuery,
  revokeSessionSchema,
  sanitizeTextInput,
  updatePermissionsSchema,
  updateRoleSchema
} from "@/features/security/domain/security-schemas";
import { ADMIN_ROLES, ROLE_LABELS, buildPermissionMatrix } from "@/features/security/domain/permissions";
import {
  auditRepository,
  loginHistoryRepository,
  permissionRepository,
  roleRepository,
  sessionRepository
} from "@/features/security/infrastructure/security-repository";
import type { AdminRole, PermissionKey } from "@/types/security";

export class SecurityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityValidationError";
  }
}

export function handleSecurityServiceError(error: unknown) {
  if (error instanceof SecurityValidationError || error instanceof ZodError) {
    const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid request." : error.message;
    return { message, status: 400 };
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
    status: 500
  };
}

export async function getSecurityAudit(searchParams: URLSearchParams) {
  const query = parseSecurityQuery(searchParams);
  return auditRepository.list({
    page: query.page,
    pageSize: query.pageSize,
    action: query.action,
    resource: query.resource,
    userId: query.userId,
    from: query.from,
    to: query.to
  });
}

export async function getSecurityRoles() {
  const roles = await roleRepository.list();
  return {
    roles,
    availableRoles: ADMIN_ROLES.filter((role: AdminRole) => role !== "customer")
  };
}

export async function getSecurityPermissions() {
  const overrides = await permissionRepository.listOverrides();
  return {
    matrix: buildPermissionMatrix(overrides),
    overrides
  };
}

export async function updateSecurityRole(body: unknown, actor: AdminAccessContext, request: NextRequest) {
  const input = updateRoleSchema.parse(body);
  const role = await roleRepository.upsert({
    userId: input.userId,
    email: sanitizeTextInput(input.email, 320),
    role: input.role,
    assignedBy: actor.userId
  });

  await recordAuditEvent({
    request,
    userId: actor.userId,
    userName: actor.userName,
    userEmail: actor.userEmail,
    action: "role_change",
    resource: "users",
    resourceId: role.userId,
    details: { email: role.email, role: role.role }
  });

  return role;
}

export async function updateSecurityPermissions(body: unknown, actor: AdminAccessContext, request: NextRequest) {
  const input = updatePermissionsSchema.parse(body);

  if (input.role === "super_admin") {
    throw new SecurityValidationError("Super Admin permissions cannot be modified.");
  }

  await permissionRepository.upsertMany(
    input.role,
    input.permissions.map((entry) => ({
      permission: entry.permission as PermissionKey,
      allowed: entry.allowed
    }))
  );

  await recordAuditEvent({
    request,
    userId: actor.userId,
    userName: actor.userName,
    userEmail: actor.userEmail,
    action: "permission_change",
    resource: "permissions",
    resourceId: input.role,
    details: { role: input.role, count: input.permissions.length }
  });

  return getSecurityPermissions();
}

export async function getSecuritySessions(currentSessionToken?: string | null) {
  return sessionRepository.listActive(currentSessionToken);
}

export async function revokeSecuritySession(body: unknown, actor: AdminAccessContext, request: NextRequest) {
  const input = revokeSessionSchema.parse(body);
  const session = await sessionRepository.revoke(input.sessionId);

  await recordAuditEvent({
    request,
    userId: actor.userId,
    userName: actor.userName,
    userEmail: actor.userEmail,
    action: "session_revoke",
    resource: "sessions",
    resourceId: input.sessionId,
    details: { targetUserEmail: session.userEmail }
  });

  return session;
}

export async function getSecurityLoginHistory(searchParams: URLSearchParams) {
  const query = parseSecurityQuery(searchParams);
  return loginHistoryRepository.list({
    page: query.page,
    pageSize: query.pageSize,
    userId: query.userId
  });
}

export function getRoleLabel(role: AdminRole) {
  return ROLE_LABELS[role];
}
