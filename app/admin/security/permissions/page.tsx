import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PermissionsMatrix } from "@/features/security/client";
import { getSecurityPermissions } from "@/features/security/server";

export const metadata: Metadata = {
  title: "Security Permissions"
};

export const dynamic = "force-dynamic";

export default async function SecurityPermissionsPage() {
  const data = await getSecurityPermissions().catch(() => null);

  if (!data) {
    redirect("/admin/login?next=/admin/security/permissions");
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Permission Matrix"
        description="Review module access across products, orders, inventory, analytics, settings, and security."
      />
      <PermissionsMatrix matrix={data.matrix} />
    </section>
  );
}
