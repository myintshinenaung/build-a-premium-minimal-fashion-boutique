/** Server-only orders exports. Import from Server Components, route handlers, and server actions. */
export { customerService } from "@/features/orders/application/customer-service";
export { orderService } from "@/features/orders/application/order-service";
export { customerRepository } from "@/features/orders/infrastructure/customer-repository";
export { orderRepository } from "@/features/orders/infrastructure/order-repository";
export { AdminCustomersPage } from "@/features/orders/ui/admin/AdminCustomersPage";
export { AdminOrdersPage } from "@/features/orders/ui/admin/AdminOrdersPage";
