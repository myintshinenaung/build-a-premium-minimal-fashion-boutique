import { describe, expect, it } from "vitest";
import {
  calculateAvailableStock,
  canReserveStock,
  isReservationExpired,
  sumReservedQuantities
} from "@/features/inventory/domain/stock-calculator";

describe("stock-calculator", () => {
  it("calculates available stock without going negative", () => {
    expect(calculateAvailableStock(10, 3)).toBe(7);
    expect(calculateAvailableStock(5, 8)).toBe(0);
  });

  it("validates reservation quantities", () => {
    expect(canReserveStock(4, 2)).toBe(true);
    expect(canReserveStock(4, 4)).toBe(true);
    expect(canReserveStock(4, 5)).toBe(false);
    expect(canReserveStock(4, 0)).toBe(false);
  });

  it("sums reserved quantities", () => {
    expect(sumReservedQuantities([2, 3, 1])).toBe(6);
    expect(sumReservedQuantities([])).toBe(0);
  });

  it("detects expired reservations", () => {
    const now = new Date("2026-07-25T12:00:00.000Z");
    expect(isReservationExpired("2026-07-25T11:59:59.000Z", now)).toBe(true);
    expect(isReservationExpired("2026-07-25T12:00:01.000Z", now)).toBe(false);
  });
});

describe("overselling prevention", () => {
  it("blocks reservations above available stock", () => {
    const current = 6;
    const reserved = 4;
    const available = calculateAvailableStock(current, reserved);
    const requested = 3;

    expect(canReserveStock(available, requested)).toBe(false);
  });

  it("allows reservations within available stock", () => {
    const current = 10;
    const reserved = 3;
    const available = calculateAvailableStock(current, reserved);
    const requested = 7;

    expect(canReserveStock(available, requested)).toBe(true);
  });
});
