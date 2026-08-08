import type { Metadata } from "next";
import { SettingsForm } from "@/features/account/client";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { requireCustomerPage } from "@/features/account/server";

export const metadata: Metadata = {
  title: "Settings"
};

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await requireCustomerPage("/account/settings");

  return (
    <AccountShell title="Settings" description="Simple account preferences for your NOVORA profile.">
      <SettingsForm profile={session.account} />
    </AccountShell>
  );
}
