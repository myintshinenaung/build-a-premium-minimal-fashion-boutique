import { orderRepository } from "@/lib/repositories/order-repository";

export const orderService = {
  getOrders() {
    return orderRepository.list();
  }
};
