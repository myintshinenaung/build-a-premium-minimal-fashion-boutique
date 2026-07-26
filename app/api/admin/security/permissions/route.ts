import { createSecurityGetRoute, createSecurityPatchRoute } from "@/features/security/application/security-route";
import { getSecurityPermissions, updateSecurityPermissions } from "@/features/security/application/security-service";

export const GET = createSecurityGetRoute(async () => getSecurityPermissions());

export const PATCH = createSecurityPatchRoute(async (body, context, request) =>
  updateSecurityPermissions(body, context, request)
);
