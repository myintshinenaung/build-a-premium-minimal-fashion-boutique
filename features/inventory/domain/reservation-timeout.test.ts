import { describe, expect, it } from "vitest";
import { createReservationExpiryDate, DEFAULT_RESERVATION_TIMEOUT_MINUTES } from "@/features/inventory/domain/reservation-timeout";

describe("reservation-timeout", () => {
  it("defaults to fifteen minutes", () => {
    expect(DEFAULT_RESERVATION_TIMEOUT_MINUTES).toBe(15);
  });

  it("creates a future expiry timestamp", () => {
    const before = Date.now();
    const expiresAt = createReservationExpiryDate(15);
    const after = Date.now() + 15 * 60_000;

    expect(new Date(expiresAt).getTime()).toBeGreaterThanOrEqual(before + 14 * 60_000);
    expect(new Date(expiresAt).getTime()).toBeLessThanOrEqual(after + 1_000);
  });
});
