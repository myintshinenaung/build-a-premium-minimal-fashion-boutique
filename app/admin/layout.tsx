import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { ADMIN_PUBLIC_PATHS, getAdminUser } from "@/features/identity/server";
import { getAdminUnreadCount } from "@/features/notifications/server";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | NOVORA Admin"
  },
  description: "NOVORA platform admin dashboard for store management.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();
  const pathname = (await headers()).get("x-admin-pathname") ?? "";
  const isPublicAdminRoute = ADMIN_PUBLIC_PATHS.some((path) => pathname === path);

  if (!user && pathname && !isPublicAdminRoute) {
    redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  const unreadCount = user ? await getAdminUnreadCount(user.id).catch(() => 0) : 0;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  );
}
