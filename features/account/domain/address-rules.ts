import type { CustomerAddress } from "@/types/account";

export function resolveDefaultAddressSelection(
  addresses: CustomerAddress[],
  targetAddressId: string,
  makeDefault: boolean
) {
  if (!makeDefault) {
    return addresses;
  }

  return addresses.map((address) => ({
    ...address,
    isDefault: address.id === targetAddressId
  }));
}

export function ensureDefaultAddress(addresses: CustomerAddress[]) {
  if (addresses.length === 0) {
    return addresses;
  }

  const hasDefault = addresses.some((address) => address.isDefault);

  if (hasDefault) {
    return addresses;
  }

  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === 0
  }));
}

export function pickNextDefaultAddressId(addresses: CustomerAddress[], deletedAddressId: string) {
  const remaining = addresses.filter((address) => address.id !== deletedAddressId);

  if (remaining.length === 0) {
    return null;
  }

  const currentDefault = remaining.find((address) => address.isDefault);
  return currentDefault?.id ?? remaining[0]?.id ?? null;
}
