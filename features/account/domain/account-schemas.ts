import { z } from "zod";
import { locales } from "@/features/i18n/domain/config";

export const updateProfileInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  avatarUrl: z.string().trim().url("Enter a valid avatar URL.").or(z.literal("")),
  preferredLanguage: z.enum(locales)
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const addressInputSchema = z.object({
  label: z.string().trim().max(80).optional(),
  recipientName: z.string().trim().min(1, "Recipient name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  addressLine: z.string().trim().min(1, "Address is required."),
  township: z.string().trim().min(1, "Township is required."),
  isDefault: z.boolean().optional()
});

export type AddressInput = z.infer<typeof addressInputSchema>;
