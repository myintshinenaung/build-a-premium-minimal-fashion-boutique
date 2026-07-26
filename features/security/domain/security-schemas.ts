import { z } from "zod";
import { ADMIN_ROLES, AUDIT_ACTIONS, PERMISSION_MODULES } from "@/types/security";

export const securityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.enum(AUDIT_ACTIONS).optional(),
  resource: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export const updateRoleSchema = z.object({
  userId: z.string().trim().min(1),
  email: z.string().email(),
  role: z.enum(ADMIN_ROLES)
});

export const updatePermissionsSchema = z.object({
  role: z.enum(ADMIN_ROLES),
  permissions: z.array(
    z.object({
      permission: z.string().regex(/^[a-z_]+:(read|write|delete|approve)$/),
      allowed: z.boolean()
    })
  )
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().trim().min(1)
});

export function parseSecurityQuery(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const input =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : Object.fromEntries(
          Object.entries(searchParams).flatMap(([key, value]) => {
            if (value === undefined) return [];
            return [[key, Array.isArray(value) ? value[0] : value]];
          })
        );

  return securityQuerySchema.parse(input);
}

export function sanitizeTextInput(value: string, maxLength = 500) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export const PERMISSION_MODULE_LABELS: Record<(typeof PERMISSION_MODULES)[number], string> = {
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  inventory: "Inventory",
  coupons: "Coupons",
  analytics: "Analytics",
  marketing: "Marketing",
  settings: "Settings",
  users: "Users",
  reviews: "Reviews",
  reports: "Reports"
};
