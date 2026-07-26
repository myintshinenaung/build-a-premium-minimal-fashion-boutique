import { createSecurityGetRoute, createSecurityPatchRoute } from "@/features/security/application/security-route";
import { getSecurityRoles, updateSecurityRole } from "@/features/security/application/security-service";

export const GET = createSecurityGetRoute(async () => getSecurityRoles());

export const PATCH = createSecurityPatchRoute(async (body, context, request) => updateSecurityRole(body, context, request));
