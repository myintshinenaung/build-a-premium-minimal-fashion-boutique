import { addressInputSchema } from "@/features/account/domain/account-schemas";
import { ensureDefaultAddress, pickNextDefaultAddressId } from "@/features/account/domain/address-rules";
import { AccountValidationError, AddressNotFoundError } from "@/features/account/application/account-errors";
import { addressRepository } from "@/features/account/infrastructure/address-repository";
import type { CustomerAddress } from "@/types/account";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid address details.";
}

export async function listAddresses(accountId: string): Promise<CustomerAddress[]> {
  const addresses = await addressRepository.listByAccountId(accountId);
  return ensureDefaultAddress(addresses);
}

export async function createAddress(accountId: string, input: unknown): Promise<CustomerAddress> {
  let parsed;

  try {
    parsed = addressInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AccountValidationError(formatZodError(error));
    }

    throw error;
  }

  const existing = await addressRepository.listByAccountId(accountId);
  const makeDefault = parsed.isDefault ?? existing.length === 0;

  if (makeDefault) {
    await addressRepository.clearDefaultForAccount(accountId);
  }

  return addressRepository.create({
    accountId,
    label: parsed.label ?? "",
    recipientName: parsed.recipientName,
    phone: parsed.phone,
    addressLine: parsed.addressLine,
    township: parsed.township,
    isDefault: makeDefault
  });
}

export async function updateAddress(accountId: string, addressId: string, input: unknown): Promise<CustomerAddress> {
  let parsed;

  try {
    parsed = addressInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AccountValidationError(formatZodError(error));
    }

    throw error;
  }

  const current = await addressRepository.getByIdForAccount(addressId, accountId);

  if (!current) {
    throw new AddressNotFoundError("Address not found.");
  }

  const makeDefault = parsed.isDefault ?? current.isDefault;

  if (makeDefault) {
    await addressRepository.clearDefaultForAccount(accountId, addressId);
  }

  const updated = await addressRepository.update(addressId, accountId, {
    label: parsed.label ?? "",
    recipientName: parsed.recipientName,
    phone: parsed.phone,
    addressLine: parsed.addressLine,
    township: parsed.township,
    isDefault: makeDefault
  });

  if (!updated) {
    throw new AddressNotFoundError("Address not found.");
  }

  return updated;
}

export async function deleteAddress(accountId: string, addressId: string) {
  const current = await addressRepository.getByIdForAccount(addressId, accountId);

  if (!current) {
    throw new AddressNotFoundError("Address not found.");
  }

  await addressRepository.delete(addressId, accountId);

  if (current.isDefault) {
    const remaining = await addressRepository.listByAccountId(accountId);
    const nextDefaultId = pickNextDefaultAddressId(remaining, addressId);

    if (nextDefaultId) {
      await addressRepository.setDefault(nextDefaultId, accountId);
    }
  }

  return { ok: true as const };
}
