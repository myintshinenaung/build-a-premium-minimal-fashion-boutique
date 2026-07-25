import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PUBLIC_PATHS } from "@/features/identity/domain/admin-auth";
import { isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { getAdminProxySession } from "@/features/identity/infrastructure/supabase-auth-proxy";

function withAdminPathname(response: NextResponse, pathname: string) {
  response.headers.set("x-admin-pathname", pathname);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
