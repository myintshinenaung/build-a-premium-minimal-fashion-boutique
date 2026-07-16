import { customerRepository } from "@/lib/repositories/customer-repository";

export const customerService = {
  getCustomers() {
    return customerRepository.list();
  }
};
