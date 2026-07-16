export const ADMIN_SESSION_COOKIE = "atelier_lune_admin_session";
export const ADMIN_SESSION_STORAGE_KEY = "atelier_lune_admin_session";
export const ADMIN_THEME_STORAGE_KEY = "atelier_lune_admin_theme";

export const MOCK_ADMIN_USER = {
  name: "Atelier Admin",
  email: "admin@atelierlune.example",
  role: "Store Manager"
};

export const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password"];
export const ADMIN_SHELLLESS_PATHS = [...ADMIN_PUBLIC_PATHS, "/admin/logout"];

export const DEFAULT_ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
export const EXTENDED_ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
