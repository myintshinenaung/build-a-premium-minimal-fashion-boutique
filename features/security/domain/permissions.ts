import type { AdminRole, PermissionAction, PermissionKey, PermissionModule } from "@/types/security";
import { ADMIN_ROLES, PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/types/security";

export { ADMIN_ROLES, PERMISSION_ACTIONS, PERMISSION_MODULES };

export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  super_admin: PERMISSION_MODULES.flatMap((module) =>
    PERMISSION_ACTIONS.map((action) => `${module}:${action}` as PermissionKey)
  ),
  admin: [
    "products:read",
    "products:write",
    "products:delete",
    "orders:read",
    "orders:write",
    "orders:approve",
    "customers:read",
    "customers:write",
    "inventory:read",
    "inventory:write",
    "coupons:read",
    "coupons:write",
    "analytics:read",
    "marketing:read",
    "marketing:write",
    "settings:read",
    "settings:write",
    "users:read",
    "reviews:read",
    "reviews:write",
    "reviews:approve",
    "reports:read"
  ],
  manager: [
    "products:read",
    "products:write",
    "orders:read",
    "orders:write",
    "customers:read",
    "inventory:read",
    "inventory:write",
    "coupons:read",
    "analytics:read",
    "marketing:read",
    "marketing:write",
    "reviews:read",
    "reviews:write",
    "reports:read"
  ],
  staff: ["products:read", "orders:read", "customers:read", "inventory:read", "reviews:read"],
  customer: []
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer"
};

export function buildPermissionMatrix(overrides: Array<{ role: AdminRole; permission: PermissionKey; allowed: boolean }>) {
  const matrix = Object.fromEntries(ADMIN_ROLES.map((role) => [role, [...DEFAULT_ROLE_PERMISSIONS[role]]])) as Record<
    AdminRole,
    PermissionKey[]
  >;

  for (const override of overrides) {
    const current = new Set(matrix[override.role]);
    if (override.allowed) {
      current.add(override.permission);
    } else {
      current.delete(override.permission);
    }
    matrix[override.role] = Array.from(current).sort();
  }

  return matrix;
}

export function hasPermission(
  role: AdminRole,
  permission: PermissionKey,
  overrides: Array<{ role: AdminRole; permission: PermissionKey; allowed: boolean }> = []
) {
  if (role === "super_admin") {
    return true;
  }

  const override = overrides.find((entry) => entry.role === role && entry.permission === permission);
  if (override) {
    return override.allowed;
  }

  return DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
}

export function resolvePermissionForRoute(pathname: string, method: string): PermissionKey | null {
  if (pathname.startsWith("/api/admin/auth/")) {
    return null;
  }

  const module = resolveModuleFromPath(pathname);
  if (!module) {
    return "reports:read";
  }

  if (method === "GET" || method === "HEAD") {
    return `${module}:read`;
  }

  if (method === "DELETE") {
    return `${module}:delete`;
  }

  if (pathname.includes("/approve") || pathname.includes("/reject")) {
    return `${module}:approve`;
  }

  return `${module}:write`;
}

function resolveModuleFromPath(pathname: string): PermissionModule | null {
  if (pathname.startsWith("/api/admin/products") || pathname.startsWith("/api/admin/categories")) {
    return "products";
  }

  if (pathname.startsWith("/api/admin/orders") || pathname.startsWith("/api/orders/")) {
    return "orders";
  }

  if (pathname.startsWith("/api/admin/customers")) {
    return "customers";
  }

  if (pathname.startsWith("/api/admin/inventory") || pathname.startsWith("/api/inventory/")) {
    return "inventory";
  }

  if (pathname.startsWith("/api/admin/promotions")) {
    return "coupons";
  }

  if (pathname.startsWith("/api/admin/analytics")) {
    return "analytics";
  }

  if (pathname.startsWith("/api/admin/flash-sales") || pathname.startsWith("/api/admin/banners") || pathname.startsWith("/api/admin/media") || pathname.startsWith("/api/admin/notifications")) {
    return "marketing";
  }

  if (pathname.startsWith("/api/admin/settings")) {
    return "settings";
  }

  if (pathname.startsWith("/api/admin/security")) {
    return "users";
  }

  if (pathname.startsWith("/api/admin/reviews")) {
    return "reviews";
  }

  return null;
}

export function normalizeAdminRole(value: string | null | undefined, fallback: AdminRole = "admin"): AdminRole {
  if (value && ADMIN_ROLES.includes(value as AdminRole)) {
    return value as AdminRole;
  }

  if (value === "admin" || value === "Store Manager") {
    return "admin";
  }

  return fallback;
}

export const SESSION_TIMEOUT_HOURS = 8;

export function getSessionExpiryDate(from = new Date()) {
  const expiresAt = new Date(from);
  expiresAt.setHours(expiresAt.getHours() + SESSION_TIMEOUT_HOURS);
  return expiresAt.toISOString();
}

export function isSessionExpired(expiresAt: string, now = new Date()) {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function parseDeviceLabel(userAgent: string | null | undefined) {
  if (!userAgent) {
    return "Unknown device";
  }

  if (/mobile/i.test(userAgent)) {
    return "Mobile browser";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows desktop";
  }

  if (/mac os/i.test(userAgent)) {
    return "Mac desktop";
  }

  return "Web browser";
}
