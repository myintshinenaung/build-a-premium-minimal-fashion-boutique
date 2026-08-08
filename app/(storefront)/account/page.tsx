import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountAuthPanel, AccountHub } from "@/features/account/client";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { getCustomerSession } from "@/features/account/server";

export const metadata: Metadata = {
  title: "Account"
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    return (
      <AccountShell title="Account" description="Sign in to manage your orders, wishlist and account." backHref={null}>
        <Suspense fallback={<p className="text-sm text-novora-muted">Loading…</p>}>
          <AccountAuthPanel />
        </Suspense>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Account" description="Manage your NOVORA profile, orders, and addresses." backHref={null}>
      <AccountHub profile={session.account} />
    </AccountShell>
  );
}
