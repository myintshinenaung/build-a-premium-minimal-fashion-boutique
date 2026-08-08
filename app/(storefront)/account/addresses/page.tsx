import type { Metadata } from "next";
import { AddressManager } from "@/features/account/client";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { listAddresses, requireCustomerPage } from "@/features/account/server";

export const metadata: Metadata = {
  title: "Addresses"
};

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const session = await requireCustomerPage("/account/addresses");
  const addresses = await listAddresses(session.account.id);

  return (
    <AccountShell title="Addresses" description="Manage your Address book for Myanmar delivery.">
      <AddressManager initialAddresses={addresses} />
    </AccountShell>
  );
}
