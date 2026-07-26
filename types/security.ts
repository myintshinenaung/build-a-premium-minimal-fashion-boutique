export const ADMIN_ROLES = ["super_admin", "admin", "manager", "staff", "customer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PERMISSION_MODULES = [
  "products",
  "orders",
  "customers",
  "inventory",
  "coupons",
  "analytics",
  "marketing",
  "settings",
  "users",
  "reviews",
  "reports"
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ["read", "write", "delete", "approve"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionKey = `${PermissionModule}:${PermissionAction}`;

export const AUDIT_ACTIONS = [
  "login",
  "logout",
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "inventory_adjustment",
  "coupon_change",
  "role_change",
  "permission_change",
  "session_revoke"
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AdminRoleAssignment = {
  userId: string;
  email: string;
  role: AdminRole;
  assignedBy: string | null;
  assignedAt: string;
  updatedAt: string;
};

export type RolePermission = {
  role: AdminRole;
  permission: PermissionKey;
  allowed: boolean;
};

export type AuditLogEntry = {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminSessionRecord = {
  id: string;
  userId: string;
  userEmail: string;
  sessionToken: string;
  deviceLabel: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  isCurrent?: boolean;
};

export type LoginHistoryEntry = {
  id: string;
  userId: string | null;
  userEmail: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  deviceLabel: string | null;
  failureReason: string | null;
  createdAt: string;
};

export type SecurityRolesResponse = {
  roles: AdminRoleAssignment[];
  availableRoles: AdminRole[];
};

export type SecurityPermissionsResponse = {
  matrix: Record<AdminRole, PermissionKey[]>;
  overrides: RolePermission[];
};

export type SecurityAuditResponse = {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SecuritySessionsResponse = {
  items: AdminSessionRecord[];
  total: number;
};

export type SecurityLoginHistoryResponse = {
  items: LoginHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
