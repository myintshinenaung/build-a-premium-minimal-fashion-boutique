import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActiveSessionsTable } from "@/features/security/client";
import { getSecuritySessions } from "@/features/security/server";

export const metadata: Metadata = {
  title: "Active Sessions"
};

export const dynamic = "force-dynamic";

export default async function SecuritySessionsPage() {
  const data = await getSecuritySessions().catch(() => null);

  if (!data) {
    redirect("/admin/login?next=/admin/security/sessions");
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Active Sessions"
        description="Monitor signed-in devices and revoke suspicious sessions. Sessions expire after 8 hours."
      />
      <ActiveSessionsTable items={data.items} />
    </section>
  );
}
