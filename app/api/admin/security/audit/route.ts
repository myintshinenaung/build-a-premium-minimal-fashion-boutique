import { createSecurityGetRoute } from "@/features/security/application/security-route";
import { getSecurityAudit } from "@/features/security/application/security-service";

export const GET = createSecurityGetRoute(async (searchParams) => getSecurityAudit(searchParams));
