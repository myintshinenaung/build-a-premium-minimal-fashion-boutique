import type { Metadata } from "next";
import { AdminLogoutClient } from "@/features/identity/client";

export const metadata: Metadata = {
  title: "Logout"
};

export default function AdminLogoutPage() {
  return <AdminLogoutClient />;
}
