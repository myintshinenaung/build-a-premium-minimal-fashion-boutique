import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogTable } from "@/features/security/client";
import { getSecurityAudit } from "@/features/security/server";

export const metadata: Metadata = {
  title: "Security Audit Logs"
};

export const dynamic = "force-dynamic";

type SecurityAuditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityAuditPage({ searchParams }: SecurityAuditPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedSearchParams ?? {}).flatMap(([key, value]) => {
      if (value === undefined) return [];
      return [[key, Array.isArray(value) ? value[0] : value]];
    })
  );

  const data = await getSecurityAudit(params).catch(() => null);

  if (!data) {
    redirect("/admin/login?next=/admin/security/audit");
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Audit Logs" description="Immutable record of logins, updates, approvals, and security changes." />
      <AuditLogTable items={data.items} />
    </section>
  );
}
