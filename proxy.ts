/** Next.js root proxy entry. `config` must be defined here (not re-exported). Handler: `@/features/identity/infrastructure/admin-proxy`. */
export { proxy } from "@/features/identity/infrastructure/admin-proxy";

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"]
};
