import { z } from "zod";

export const customerAuthCredentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const customerSignUpSchema = customerAuthCredentialsSchema.extend({
  name: z.string().trim().min(1, "Name is required.").max(80)
});

export const customerForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.")
});

export type CustomerAuthCredentials = z.infer<typeof customerAuthCredentialsSchema>;
export type CustomerSignUpInput = z.infer<typeof customerSignUpSchema>;
export type CustomerForgotPasswordInput = z.infer<typeof customerForgotPasswordSchema>;
