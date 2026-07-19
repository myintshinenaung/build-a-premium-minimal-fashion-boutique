import type { User } from "@supabase/supabase-js";

const ADMIN_ROLE = "admin";

function getAllowedAdminEmails() {
  const raw = process.env.ADMIN_ALLOWED_EMAILS?.trim();

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function hasAdminRole(user: User) {
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;

  return appRole === ADMIN_ROLE || userRole === ADMIN_ROLE;
}

export function isAuthorizedAdmin(user: User | null | undefined) {
  if (!user?.email) {
    return false;
  }

  if (hasAdminRole(user)) {
    return true;
  }

  const allowedEmails = getAllowedAdminEmails();

  if (allowedEmails.length === 0) {
    return false;
  }

  return allowedEmails.includes(user.email.toLowerCase());
}

export function getAdminAuthorizationErrorMessage() {
  const allowedEmails = getAllowedAdminEmails();

  if (allowedEmails.length === 0) {
    return "Admin access is restricted. Set ADMIN_ALLOWED_EMAILS or assign the admin role in Supabase user metadata.";
  }

  return "This account is not authorized for admin access.";
}
