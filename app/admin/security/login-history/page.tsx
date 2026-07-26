import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoginHistoryTable } from "@/features/security/client";
import { getSecurityLoginHistory } from "@/features/security/server";

export const metadata: Metadata = {
  title: "Login History"
};

export const dynamic = "force-dynamic";

type SecurityLoginHistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityLoginHistoryPage({ searchParams }: SecurityLoginHistoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedSearchParams ?? {}).flatMap(([key, value]) => {
      if (value === undefined) return [];
      return [[key, Array.isArray(value) ? value[0] : value]];
    })
  );

  const data = await getSecurityLoginHistory(params).catch(() => null);

  if (!data) {
    redirect("/admin/login?next=/admin/security/login-history");
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Login History" description="Successful and failed admin sign-in attempts with device and IP metadata." />
      <LoginHistoryTable items={data.items} />
    </section>
  );
}
