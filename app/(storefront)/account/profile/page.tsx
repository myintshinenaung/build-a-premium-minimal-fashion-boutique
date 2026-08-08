import type { Metadata } from "next";
import { ProfileForm } from "@/features/account/client";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { requireCustomerPage } from "@/features/account/server";

export const metadata: Metadata = {
  title: "Profile"
};

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const session = await requireCustomerPage("/account/profile");

  return (
    <AccountShell title="Profile" description="Update the details supported by your NOVORA account.">
      <ProfileForm profile={session.account} />
    </AccountShell>
  );
}
