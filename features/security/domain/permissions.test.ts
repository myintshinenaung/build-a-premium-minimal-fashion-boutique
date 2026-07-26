import { describe, expect, it } from "vitest";
import {
  buildPermissionMatrix,
  hasPermission,
  isSessionExpired,
  normalizeAdminRole,
  resolvePermissionForRoute
} from "@/features/security/domain/permissions";

describe("security permissions", () => {
  it("grants super admin all permissions", () => {
    expect(hasPermission("super_admin", "users:delete")).toBe(true);
  });

  it("respects default role permissions", () => {
    expect(hasPermission("staff", "products:read")).toBe(true);
    expect(hasPermission("staff", "products:write")).toBe(false);
  });

  it("applies permission overrides", () => {
    const overrides = [{ role: "staff" as const, permission: "products:write" as const, allowed: true }];
    expect(hasPermission("staff", "products:write", overrides)).toBe(true);
  });

  it("builds permission matrix with overrides", () => {
    const matrix = buildPermissionMatrix([
      { role: "staff", permission: "inventory:write", allowed: true }
    ]);

    expect(matrix.staff).toContain("inventory:write");
  });

  it("maps admin routes to permissions", () => {
    expect(resolvePermissionForRoute("/api/admin/products", "GET")).toBe("products:read");
    expect(resolvePermissionForRoute("/api/admin/products/123", "PATCH")).toBe("products:write");
    expect(resolvePermissionForRoute("/api/admin/inventory/adjust", "POST")).toBe("inventory:write");
    expect(resolvePermissionForRoute("/api/admin/auth/login", "POST")).toBeNull();
  });

  it("normalizes legacy role values", () => {
    expect(normalizeAdminRole("Store Manager")).toBe("admin");
    expect(normalizeAdminRole("manager")).toBe("manager");
  });

  it("detects expired sessions", () => {
    expect(isSessionExpired(new Date(Date.now() - 1000).toISOString())).toBe(true);
    expect(isSessionExpired(new Date(Date.now() + 60_000).toISOString())).toBe(false);
  });
});
