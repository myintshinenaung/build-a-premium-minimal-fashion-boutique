import { updateProfileInputSchema } from "@/features/account/domain/account-schemas";
import { AccountNotFoundError, AccountValidationError } from "@/features/account/application/account-errors";
import { accountRepository } from "@/features/account/infrastructure/account-repository";
import type { CustomerProfile } from "@/types/account";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid profile details.";
}

export async function getProfile(accountId: string): Promise<CustomerProfile> {
  const profile = await accountRepository.getById(accountId);

  if (!profile) {
    throw new AccountNotFoundError("Customer account not found.");
  }

  return profile;
}

export async function updateProfile(accountId: string, input: unknown): Promise<CustomerProfile> {
  let parsed;

  try {
    parsed = updateProfileInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AccountValidationError(formatZodError(error));
    }

    throw error;
  }

  const profile = await accountRepository.update(accountId, {
    name: parsed.name,
    phone: parsed.phone,
    email: parsed.email,
    avatarUrl: parsed.avatarUrl,
    preferredLanguage: parsed.preferredLanguage
  });

  if (!profile) {
    throw new AccountNotFoundError("Customer account not found.");
  }

  return profile;
}
