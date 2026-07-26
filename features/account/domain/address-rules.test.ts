import { describe, expect, it } from "vitest";
import { ensureDefaultAddress, pickNextDefaultAddressId, resolveDefaultAddressSelection } from "@/features/account/domain/address-rules";
import type { CustomerAddress } from "@/types/account";

const sampleAddresses: CustomerAddress[] = [
  {
    id: "ADDR-1",
    accountId: "ACC-1",
    label: "Home",
    recipientName: "Aye Aye",
    phone: "09123456789",
    addressLine: "12 Main Road",
    township: "Yangon",
    isDefault: false,
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z"
  },
  {
    id: "ADDR-2",
    accountId: "ACC-1",
    label: "Office",
    recipientName: "Aye Aye",
    phone: "09123456789",
    addressLine: "88 Business Park",
    township: "Yangon",
    isDefault: true,
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z"
  }
];

describe("address-rules", () => {
  it("marks the first address as default when none is set", () => {
    const addresses = ensureDefaultAddress(sampleAddresses.map((address) => ({ ...address, isDefault: false })));

    expect(addresses[0]?.isDefault).toBe(true);
    expect(addresses[1]?.isDefault).toBe(false);
  });

  it("keeps an existing default address unchanged", () => {
    const addresses = ensureDefaultAddress(sampleAddresses);

    expect(addresses.find((address) => address.id === "ADDR-2")?.isDefault).toBe(true);
  });

  it("selects the next default when deleting the current default", () => {
    expect(pickNextDefaultAddressId(sampleAddresses, "ADDR-2")).toBe("ADDR-1");
  });

  it("updates default selection when making an address default", () => {
    const addresses = resolveDefaultAddressSelection(sampleAddresses, "ADDR-1", true);

    expect(addresses.find((address) => address.id === "ADDR-1")?.isDefault).toBe(true);
    expect(addresses.find((address) => address.id === "ADDR-2")?.isDefault).toBe(false);
  });
});
