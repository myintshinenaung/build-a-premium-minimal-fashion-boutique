import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RolesTable } from "@/features/security/client";
import { getSecurityRoles } from "@/features/security/server";

export const metadata: Metadata = {
  title: "Security Roles"
};

export const dynamic = "force-dynamic";

export default async function SecurityRolesPage() {
  const data = await getSecurityRoles().catch(() => null);

  if (!data) {
    redirect("/admin/login?next=/admin/security/roles");
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Role Management"
        description="Assign Super Admin, Admin, Manager, and Staff roles to authorized users."
      />
      <RolesTable roles={data.roles} availableRoles={data.availableRoles} />
    </section>
  );
}
