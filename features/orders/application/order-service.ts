import { orderRepository } from "@/features/orders/infrastructure/order-repository";

export const orderService = {
  getOrders() {
    return orderRepository.list();
  }
};
