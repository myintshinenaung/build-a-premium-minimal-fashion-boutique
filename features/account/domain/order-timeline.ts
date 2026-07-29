import type { OrderTimelineEvent } from "@/types/account";
import type { StorefrontOrder } from "@/types/order";

export function buildOrderTimeline(order: StorefrontOrder): OrderTimelineEvent[] {
  const timeline: OrderTimelineEvent[] = [
    {
      key: "placed",
      label: "Order placed",
      at: order.createdAt,
      description: "Your order was received."
    }
  ];

  if (order.paymentStatus === "processing") {
    timeline.push({
      key: "payment_processing",
      label: "Payment processing",
      at: order.createdAt,
      description: "Payment is being processed."
    });
  }

  if (order.paymentStatus === "paid") {
    timeline.push({
      key: "payment_paid",
      label: "Payment received",
      at: order.paidAt ?? order.createdAt,
      description: "Your payment was confirmed."
    });
  }

  if (order.paymentStatus === "failed") {
    timeline.push({
      key: "payment_failed",
      label: "Payment failed",
      at: order.createdAt,
      description: "Payment could not be completed."
    });
  }

  if (order.status === "Confirmed" || order.status === "Packed" || order.status === "Completed") {
    timeline.push({
      key: "confirmed",
      label: "Order confirmed",
      at: order.paidAt ?? order.createdAt,
      description: "The store confirmed your order."
    });
  }

  if (order.status === "Packed" || order.status === "Completed") {
    timeline.push({
      key: "packed",
      label: "Order packed",
      at: order.paidAt ?? order.createdAt,
      description: "Your order is packed and ready to ship."
    });
  }

  if (order.shippingStatus === "shipped") {
    timeline.push({
      key: "shipped",
      label: "Order shipped",
      at: order.paidAt ?? order.createdAt,
      description: [order.carrier, order.trackingNumber].filter(Boolean).join(" · ") || "Your order is on the way."
    });
  }

  if (order.status === "Completed") {
    timeline.push({
      key: "completed",
      label: "Order completed",
      at: order.paidAt ?? order.createdAt,
      description: "Your order is complete."
    });
  }

  return timeline;
}
