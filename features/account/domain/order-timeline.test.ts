import { describe, expect, it } from "vitest";
import { buildOrderTimeline } from "@/features/account/domain/order-timeline";
import type { StorefrontOrder } from "@/types/order";

function createOrder(overrides: Partial<StorefrontOrder> = {}): StorefrontOrder {
  return {
    id: "ORD-1",
    accountId: "ACC-1",
    customer: "Aye Aye",
    customerPhone: "09123456789",
    customerEmail: "aye@example.com",
    shippingAddress: "12 Main Road",
    township: "Yangon",
    notes: "",
    subtotalMmk: 100000,
    shippingMmk: 3000,
    totalMmk: 103000,
    status: "Pending",
    channel: "Web",
    paymentId: null,
    paymentProvider: "stripe",
    paymentStatus: "pending",
    paidAt: null,
    shippingStatus: "pending",
    trackingNumber: null,
    carrier: null,
    createdAt: "2026-07-26",
    items: [],
    ...overrides
  };
}

describe("order-timeline", () => {
  it("includes order placed for every order", () => {
    const timeline = buildOrderTimeline(createOrder());

    expect(timeline[0]).toMatchObject({ key: "placed", label: "Order placed" });
  });

  it("adds payment and shipping milestones for a completed shipped order", () => {
    const timeline = buildOrderTimeline(
      createOrder({
        status: "Completed",
        paymentStatus: "paid",
        paidAt: "2026-07-27",
        shippingStatus: "shipped",
        carrier: "DHL",
        trackingNumber: "TRACK-123"
      })
    );

    expect(timeline.map((event) => event.key)).toEqual([
      "placed",
      "payment_paid",
      "confirmed",
      "packed",
      "shipped",
      "completed"
    ]);
    expect(timeline.find((event) => event.key === "shipped")?.description).toContain("DHL");
  });

  it("includes a failed payment milestone", () => {
    const timeline = buildOrderTimeline(createOrder({ paymentStatus: "failed" }));

    expect(timeline.some((event) => event.key === "payment_failed")).toBe(true);
  });
});
