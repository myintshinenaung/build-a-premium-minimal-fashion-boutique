import type { Metadata } from "next";
import { AdminLogoutClient } from "@/components/admin/auth/AdminLogoutClient";

export const metadata: Metadata = {
  title: "Logout"
};

export default function AdminLogoutPage() {
  return <AdminLogoutClient />;
}
