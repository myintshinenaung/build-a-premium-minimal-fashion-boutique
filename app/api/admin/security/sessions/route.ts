import { createSecurityGetRoute } from "@/features/security/application/security-route";
import { getSecuritySessions } from "@/features/security/application/security-service";

export const GET = createSecurityGetRoute(async (_searchParams, context) => getSecuritySessions(context.sessionToken));
