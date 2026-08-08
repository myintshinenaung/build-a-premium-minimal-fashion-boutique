import { describe, expect, it } from "vitest";
import {
  customerAuthCredentialsSchema,
  customerForgotPasswordSchema,
  customerSignUpSchema
} from "@/features/account/domain/auth-schemas";

describe("customer auth schemas", () => {
  it("accepts valid sign-in credentials", () => {
    expect(
      customerAuthCredentialsSchema.parse({
        email: "customer@example.com",
        password: "secret1"
      })
    ).toEqual({
      email: "customer@example.com",
      password: "secret1"
    });
  });

  it("requires a name for sign-up", () => {
    const result = customerSignUpSchema.safeParse({
      email: "customer@example.com",
      password: "secret1",
      name: ""
    });

    expect(result.success).toBe(false);
  });

  it("validates forgot-password email", () => {
    expect(customerForgotPasswordSchema.parse({ email: "customer@example.com" })).toEqual({
      email: "customer@example.com"
    });
  });
});
