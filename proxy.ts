import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-authorization";
import { ADMIN_PUBLIC_PATHS } from "@/lib/admin-auth";
import { getAdminProxySession } from "@/lib/supabase/auth-proxy";

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
    return redirect;
  }

  if (isAuthorized && pathname === "/admin/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"]
};
