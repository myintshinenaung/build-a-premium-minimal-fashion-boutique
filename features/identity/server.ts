/** Server-only identity exports. Import from Server Components, route handlers, middleware, and server actions. */
export { ADMIN_PUBLIC_PATHS, ADMIN_SHELLLESS_PATHS, ADMIN_THEME_STORAGE_KEY } from "@/features/identity/domain/admin-auth";
export { getAdminAuthorizationErrorMessage, isAuthorizedAdmin } from "@/features/identity/domain/authorization";
export { getAdminUser, mapSupabaseUserToAdminUser, type AdminUser } from "@/features/identity/application/admin-session";
export { jsonError, requireAdminApiSession } from "@/features/identity/application/admin-api";
export {
  createSupabaseAuthRequestClient,
  createSupabaseAuthRouteClient,
  createSupabaseAuthServerClient
} from "@/features/identity/infrastructure/supabase-auth-server";
export { getAdminProxySession } from "@/features/identity/infrastructure/supabase-auth-proxy";
export { proxy } from "@/features/identity/infrastructure/admin-proxy";
