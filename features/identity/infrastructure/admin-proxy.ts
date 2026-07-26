import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PUBLIC_PATHS } from "@/features/identity/domain/admin-auth";
import { isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { getAdminProxySession } from "@/features/identity/infrastructure/supabase-auth-proxy";
import { applySecurityHeaders, checkRateLimit } from "@/features/security/application/api-security";

function withAdminPathname(response: NextResponse, pathname: string) {
  response.headers.set("x-admin-pathname", pathname);
  applySecurityHeaders(response.headers);
  return response;
}

function isPublicAdminApiPath(pathname: string) {
  return pathname.startsWith("/api/admin/auth/login") || pathname.startsWith("/api/admin/auth/forgot-password");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/")) {
    const rateLimit = checkRateLimit(request);
    if (rateLimit) {
      const response = NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
      applySecurityHeaders(response.headers);
      return response;
    }

    if (isPublicAdminApiPath(pathname)) {
      const response = NextResponse.next();
      applySecurityHeaders(response.headers);
      return response;
    }

    const { response, user } = await getAdminProxySession(request);
    if (!user || !isAuthorizedAdmin(user)) {
      const status = user ? 403 : 401;
      const message = user ? "Forbidden. You do not have permission to perform this action." : "Unauthorized";
      const blocked = NextResponse.json({ message }, { status });
      applySecurityHeaders(blocked.headers);
      response.cookies.getAll().forEach((cookie) => blocked.cookies.set(cookie));
      return blocked;
    }

    applySecurityHeaders(response.headers);
    return response;
  }

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAdminRoute = ADMIN_PUBLIC_PATHS.some((path) => pathname === path);

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const { response, user } = await getAdminProxySession(request);
  const isAuthorized = isAuthorizedAdmin(user);

  if ((!user || !isAuthorized) && !isPublicAdminRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);

    if (user && !isAuthorized) {
      loginUrl.searchParams.set("error", "unauthorized");
    }

    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return withAdminPathname(redirect, pathname);
  }

  if (isAuthorized && pathname === "/admin/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return withAdminPathname(NextResponse.redirect(dashboardUrl), pathname);
  }

  return withAdminPathname(response, pathname);
}
