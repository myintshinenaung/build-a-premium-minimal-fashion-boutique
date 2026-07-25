import { customerRepository } from "@/features/orders/infrastructure/customer-repository";

export const customerService = {
  getCustomers() {
    return customerRepository.list();
  }
};
