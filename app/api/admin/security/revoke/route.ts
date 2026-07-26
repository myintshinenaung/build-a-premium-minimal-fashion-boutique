import { createSecurityPostRoute } from "@/features/security/application/security-route";
import { revokeSecuritySession } from "@/features/security/application/security-service";

export const POST = createSecurityPostRoute(async (body, context, request) =>
  revokeSecuritySession(body, context, request)
);
