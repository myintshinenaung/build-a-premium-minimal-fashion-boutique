/** Client-safe identity exports. */
export { ADMIN_SHELLLESS_PATHS, ADMIN_THEME_STORAGE_KEY } from "@/features/identity/domain/admin-auth";
export type { AdminUser } from "@/features/identity/domain/admin-user";
export { requestAdminJson } from "@/features/identity/application/admin-api-client";
export { AdminForgotPasswordForm } from "@/features/identity/ui/admin/AdminForgotPasswordForm";
export { AdminLoginForm } from "@/features/identity/ui/admin/AdminLoginForm";
export { AdminLogoutClient } from "@/features/identity/ui/admin/AdminLogoutClient";
