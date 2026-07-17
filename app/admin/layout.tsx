import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getAdminUser } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Atelier Lune Admin"
  },
  description: "Admin dashboard UI for Atelier Lune boutique management.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
