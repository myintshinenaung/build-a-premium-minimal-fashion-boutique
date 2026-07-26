/** Server-only security exports. */
export {
  getSecurityAudit,
  getSecurityLoginHistory,
  getSecurityPermissions,
  getSecurityRoles,
  getSecuritySessions,
  getRoleLabel,
  handleSecurityServiceError,
  revokeSecuritySession,
  updateSecurityPermissions,
  updateSecurityRole
} from "@/features/security/application/security-service";
export {
  recordAdminLoginAttempt,
  recordAdminLogout,
  recordAuditEvent,
  resolveAdminAccess,
  type AdminAccessContext
} from "@/features/security/application/admin-access";
export { applySecurityHeaders, checkRateLimit } from "@/features/security/application/api-security";
export {
  createSecurityGetRoute,
  createSecurityPatchRoute,
  createSecurityPostRoute,
  handleSecurityApiError,
  requireSecuredAdminApi
} from "@/features/security/application/security-route";
export {
  ADMIN_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_LABELS,
  SESSION_TIMEOUT_HOURS,
  buildPermissionMatrix,
  hasPermission,
  normalizeAdminRole,
  resolvePermissionForRoute
} from "@/features/security/domain/permissions";
