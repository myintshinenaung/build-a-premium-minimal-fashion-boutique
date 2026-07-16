import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
