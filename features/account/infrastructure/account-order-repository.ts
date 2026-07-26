import { buildOrderTimeline } from "@/features/account/domain/order-timeline";
import { OrderAccessError } from "@/features/account/application/account-errors";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import type { AccountOrderDetail, AccountOrderSummary } from "@/types/account";

export const accountOrderRepository = {
  async listByAccountId(accountId: string): Promise<AccountOrderSummary[]> {
    const orders = await orderRepository.listByAccountId(accountId);

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      totalMmk: order.totalMmk,
      createdAt: order.createdAt,
      itemCount: order.items.length
    }));
  },

  async getByIdForAccount(accountId: string, orderId: string): Promise<AccountOrderDetail> {
    const order = await orderRepository.getByIdForAccount(accountId, orderId);

    if (!order) {
      throw new OrderAccessError("Order not found.");
    }

    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      totalMmk: order.totalMmk,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      customer: order.customer,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      township: order.township,
      notes: order.notes,
      subtotalMmk: order.subtotalMmk,
      shippingMmk: order.shippingMmk,
      paymentProvider: order.paymentProvider,
      paidAt: order.paidAt,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        productSlug: item.productSlug,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        lineTotalMmk: item.lineTotalMmk
      })),
      timeline: buildOrderTimeline(order)
    };
  }
};
